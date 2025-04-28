import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaArrowLeft, FaComment, FaThumbsUp, FaHeart, FaSmile } from 'react-icons/fa';

const FeedbackViews = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5555/api/feedback');
        setFeedbacks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        setError('Failed to load feedbacks. Please try again later.');
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar 
        key={index}
        className="text-yellow-400"
        color={index < rating ? "#ffc107" : "#e4e5e9"}
        size={16}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-sky-50">
      {/* Hero Section */}
      <div className="relative bg-sky-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-xl text-sky-100 max-w-3xl mx-auto">
            See what our customers are saying about their experiences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center text-sky-600 hover:text-sky-800 mb-8 group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Create Feedback Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={() => navigate('/feedback')}
            className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition duration-300"
          >
            Share Your Feedback
          </button>
        </div>

        {/* Feedbacks Grid */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="p-8 md:p-12">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-gray-600">Loading feedbacks...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-600">{error}</p>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600">No feedbacks yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {feedbacks.map((feedback) => (
                  <div 
                    key={feedback._id} 
                    className="bg-sky-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      {renderStars(feedback.rating || 0)}
                      <span className="text-sm text-gray-600">{feedback.rating || 0}/5</span>
                    </div>
                    <p className="text-gray-700">{feedback.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-sky-600 text-3xl mb-4">
              <FaComment />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Open Communication</h3>
            <p className="text-gray-600">We value your thoughts and opinions to improve our services.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-sky-600 text-3xl mb-4">
              <FaThumbsUp />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Continuous Improvement</h3>
            <p className="text-gray-600">Your feedback helps us enhance our event planning services.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-sky-600 text-3xl mb-4">
              <FaHeart />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Customer Focus</h3>
            <p className="text-gray-600">We prioritize your satisfaction and experience.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-sky-600 text-3xl mb-4">
              <FaSmile />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Better Service</h3>
            <p className="text-gray-600">Your input helps us deliver exceptional events.</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-sky-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Share Your Experience?</h2>
            <p className="text-sky-100 text-lg mb-8 max-w-2xl mx-auto">
              Your feedback helps us create better events and experiences for everyone.
            </p>
            <Link 
              to="/feedback" 
              className="inline-block bg-white text-sky-800 px-8 py-3 rounded-lg font-semibold hover:bg-sky-50 transition duration-300"
            >
              Write a Review
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackViews;
