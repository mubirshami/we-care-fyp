import { useEffect, useState } from 'react';
import picture from '../assets/images/main_image.png';
import api from '../services/api';

function Books() {
  const [allbooks, setallbooks] = useState([]);

  useEffect(() => {
    api
      .get('/books/getbooks')
      .then((response) => setallbooks(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-4">Meditation Books</h1>
          <ul className="space-y-3">
            {allbooks.map((data) => (
              <li key={data._id}>
                <a
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  {data.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-48 flex-shrink-0">
          <img src={picture} alt="cover" className="rounded shadow" />
        </div>
      </div>
    </div>
  );
}

export default Books;
