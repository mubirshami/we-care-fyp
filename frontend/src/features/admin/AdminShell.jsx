import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminShell = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isBooksOpen, setBooksOpen] = useState(false);
  const [isVideosOpen, setVideosOpen] = useState(false);

  const handleBooksClick = () => setBooksOpen(!isBooksOpen);
  const handleVideosClick = () => setVideosOpen(!isVideosOpen);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="p-4 bg-gray-50 rounded">
      <h2 className="text-lg font-semibold mb-3">Admin Panel</h2>
      <nav>
        <ul className="space-y-2">
          <li className="cursor-pointer" onClick={handleBooksClick}>
            <div className="flex justify-between items-center">
              <span>Books</span>
            </div>
            {isBooksOpen && (
              <ul className="pl-4 mt-2 space-y-1">
                <li><Link to="/addbooks" className="text-blue-600">Add Book</Link></li>
                <li><Link to="/deletebooks" className="text-blue-600">Update Book</Link></li>
              </ul>
            )}
          </li>
          <li className="cursor-pointer" onClick={handleVideosClick}>
            <div className="flex justify-between items-center">
              <span>Videos</span>
            </div>
            {isVideosOpen && (
              <ul className="pl-4 mt-2 space-y-1">
                <li><Link to="/addvideos" className="text-blue-600">Add Video</Link></li>
                <li><Link to="/deletevideos" className="text-blue-600">Delete Video</Link></li>
              </ul>
            )}
          </li>
          <li><Link to="/viewreviews" className="text-blue-600">Reviews</Link></li>
          <li><Link to="/viewusers" className="text-blue-600">Users</Link></li>
          <li className="text-red-600 cursor-pointer" onClick={handleLogout}>Logout</li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminShell;
