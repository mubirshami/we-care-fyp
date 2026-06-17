import re
from io import BytesIO
from bson.objectid import ObjectId
import joblib
import time
from flask import Flask, jsonify, request,send_file
from flask_cors import CORS
from keras import Sequential
from keras.layers import MaxPooling2D, Conv2D, Dropout, Flatten, Dense
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import numpy as np
import cv2
import matplotlib.pyplot as plt
from pymongo import MongoClient

sentiment_model = joblib.load("sentiment_analysis_model.h5")
vectorizer = joblib.load('vectorizer.pickle')

# Create an instance of Flask
app = Flask(__name__)
CORS(app)

# Define a route for the API
@app.route('/emotion-detection', methods=['GET'])
def emotion_detection():
    model = Sequential()
    model.add(Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(48, 48, 1)))
    model.add(Conv2D(64, kernel_size=(3, 3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(0.25))
    model.add(Conv2D(128, kernel_size=(3, 3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Conv2D(128, kernel_size=(3, 3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(0.25))
    model.add(Flatten())
    model.add(Dense(1024, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(7, activation='softmax'))
    model.load_weights('model.h5')

    # prevents openCL usage and unnecessary logging messages
    cv2.ocl.setUseOpenCL(False)

    # dictionary which assigns each label an emotion (alphabetical order)
    emotion_dict = {0: "Angry", 1: "Disgusted", 2: "Fearful", 3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"}
    cap = cv2.VideoCapture(0)

    start_time = time.time()
    while True:
        # Find haar cascade to draw bounding box around face
        ret, frame = cap.read()
        if not ret:
            break
        facecasc = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = facecasc.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y - 50), (x + w, y + h + 10), (255, 0, 0), 2)
            roi_gray = gray[y:y + h, x:x + w]
            cropped_img = np.expand_dims(np.expand_dims(cv2.resize(roi_gray, (48, 48)), -1), 0)
            prediction = model.predict(cropped_img)
            maxindex = int(np.argmax(prediction))
            cv2.putText(frame, emotion_dict[maxindex], (x + 20, y - 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255),
                        2, cv2.LINE_AA)
        cv2.imshow('Video', cv2.resize(frame, (1600, 960), interpolation=cv2.INTER_CUBIC))
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    total_time = time.time() - start_time
    print("Time spent is ",total_time)
    cap.release()
    cv2.destroyAllWindows()
    return jsonify({
        'emotionTime': total_time
    })


@app.route('/sentiment-analysis', methods=['POST'])
def sentiment_analysis():
    # Get the text from the request
    text = str(request.get_json('journalcontent'))
    print(text)
    # Preprocess the text
    ps = PorterStemmer()
    tweet = re.sub('@[^\s]+', '', text)  # Remove mentions
    tweet = re.sub('[^a-zA-Z0-9]', ' ', tweet)  # Remove special characters
    tweet = tweet.lower()  # Convert to lowercase
    tweet = tweet.split()  # Tokenize
    tweet = [ps.stem(word) for word in tweet if
             not word in set(stopwords.words('english'))]  # Stemming and remove stopwords
    tweet = ' '.join(tweet)  # Join tokens back into a string

    # Vectorize the tweet
    tweet_vec = vectorizer.transform([tweet]).toarray()

    # Predict the sentiment of the tweet
    sentiment = sentiment_model.predict(tweet_vec)[0]
    if sentiment == 0:
        sentiment_value = "Neutral"
    elif sentiment == 1:
        sentiment_value = "Positive"
    elif sentiment == -1:
        sentiment_value = "Negative"
    else:
        sentiment_value = "Unknown"
    # Return the result as a JSON response
    print(sentiment_value)
    return jsonify({
        'sentiment': sentiment_value
    })


@app.route('/total_time_spent', methods=['GET'])
def get_total_time_spent():
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['WECARE']
        collection = db['meditationtimes']
        result = collection.find_one()
        if result:
            print("Database connection successful!")
        else:
            print("No document found.")
    except ConnectionError:
        print("Failed to connect to the database.")

    user_id = request.args.get('user_id')
    user_id = ObjectId(user_id)
    print(user_id)
    emotion_collection = db['emotiontimes']
    emotion_cursor = emotion_collection.find({"userid": user_id})
    emotion_data = list(emotion_cursor)
    print(emotion_data)
    journal_collection = db['journaltimes']
    journal_cursor = journal_collection.find({"userid": user_id})
    journal_data = list(journal_cursor)
    print(journal_data)
    meditation_collection = db['meditationtimes']
    meditation_cursor = meditation_collection.find({"userid": user_id})
    meditation_data = list(meditation_cursor)
    print(meditation_data)
    sentiment_collection = db['journals']
    sentiment_cursor = sentiment_collection.find({"userid": user_id})
    sentiment_journal_data = list(sentiment_cursor)
    print(sentiment_journal_data)
    emotion_time = sum(data['emotionTime'] for data in emotion_data)
    journal_time = sum(data['journalTime'] for data in journal_data)
    meditation_time = sum(data['meditationTime'] for data in meditation_data)
    num_entry1 = len(emotion_data)
    avg_emotion_time = emotion_time / num_entry1
    num_entry2 = len(journal_data)
    avg_journal_time = journal_time / num_entry2
    num_entry3 = len(meditation_data)
    avg_meditation_time = meditation_time / num_entry3
    # Calculate the sentiment counts
    sentiment_counts = {
        'Positive': 0,
        'Negative': 0,
        'Neutral': 0
    }

    for data in sentiment_journal_data:
        sentiment = data['sentiment']
        sentiment_counts[sentiment] += 1

    # Generate the time spent pie chart
    labels = ['Emotion', 'Journal', 'Meditation']
    times = [emotion_time, journal_time, meditation_time]
    time_colors = ['#FF6384', '#36A2EB', '#FFCE56']

    # Generate the sentiment count bar chart
    sentiments = ['Positive', 'Negative', 'Neutral']
    counts = [sentiment_counts['Positive'], sentiment_counts['Negative'], sentiment_counts['Neutral']]
    sentiment_colors = ['#FF6384', '#36A2EB', '#FFCE56']

    # Create the combined plot
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 12))
    ax1.set_title('Time Spent On Features', y=1.05)  # Adjust y value for spacing
    ax2.set_title('Sentiment Count', y=0.9)  # Adjust y value for spacing

    # Plot time spent as a pie chart with increased size
    ax1.pie(times, labels=labels, colors=time_colors, autopct='%1.1f%%', startangle=90,
            wedgeprops={'edgecolor': 'black'})
    ax1.axis('equal')

    # Add average time spent as annotations
    ax1.text(0.5, -0.15, f'Average Emotion Time: {avg_emotion_time:.2f} seconds', ha='center', transform=ax1.transAxes)
    ax1.text(0.5, -0.25, f'Average Journal Time: {avg_journal_time:.2f} seconds', ha='center', transform=ax1.transAxes)
    ax1.text(0.5, -0.35, f'Average Meditation Time: {avg_meditation_time:.2f} seconds', ha='center',
             transform=ax1.transAxes)

    # Plot sentiment count as a bar chart
    ax2.bar(sentiments, counts, color=sentiment_colors)
    ax2.set_ylabel('Sentiment Count')

    # Adjust spacing between the subplots
    plt.subplots_adjust(hspace=0.5)

    # Save the combined plot as an image
    image_stream = BytesIO()
    plt.savefig(image_stream, format='png')
    image_stream.seek(0)

    # Send the image file to the frontend
    return send_file(image_stream, mimetype='image/png')


if __name__ == '__main__':
    app.run(debug=True)

