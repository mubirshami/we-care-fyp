import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './ToastProvider';
import mlService from '../../services/modules/ml';
import emotiontimeService from '../../services/modules/emotiontime';

const HIDDEN_PATHS = [
  '/signup',
  '/signin',
  '/admin/login',
  '/addbooks',
  '/addvideos',
  '/forgotpassword',
  '/deletevideos',
  '/deletebooks',
  '/viewreviews',
  '/viewusers',
  '/admin-panel',
];

function Navbar() {
  const navigate = useNavigate();
  const { name, token, logout } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  const isHidden =
    HIDDEN_PATHS.includes(location.pathname) || location.pathname.startsWith('/password');

  const signout = () => {
    logout();
    navigate('/signin');
  };

  const handleEmotionDetection = async () => {
    try {
      const data = await mlService.emotionDetection();
      const emotionTimeValue = data.emotionTime;
      await emotiontimeService.post({ emotionTime: emotionTimeValue }, token);
      addToast('Emotion detection complete', 'success');
    } catch (error) {
      console.error(error);
      addToast('Emotion detection failed', 'error');
    }
  };

  if (isHidden) return null;

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="font-bold text-2xl">
            We Care
          </Link>

          <div className="flex items-center">
            <ul className="flex space-x-4 mr-6">
              <li>
                <Link
                  className={`${location.pathname === '/home' ? 'font-semibold' : 'text-gray-700'}`}
                  to="/home"
                >
                  Home
                </Link>
              </li>
              <li>
                <button className="text-gray-700" onClick={handleEmotionDetection}>
                  Emotion Detection
                </button>
              </li>
              <li>
                <Link className="text-gray-700" to="/journal">
                  Journals
                </Link>
              </li>
              <li>
                <Link className="text-gray-700" to="/chatbot">
                  Chatbot
                </Link>
              </li>
              <li>
                <Link className="text-gray-700" to="/analysis">
                  Analysis
                </Link>
              </li>
              <li>
                <Link className="text-gray-700" to="/updatereviews">
                  Review
                </Link>
              </li>
            </ul>
            <div className="flex items-center space-x-4">
              <p className="text-gray-700">Welcome {name}</p>
              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={signout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
