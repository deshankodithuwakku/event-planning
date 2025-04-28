import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FaStar, FaArrowLeft, FaComment, FaThumbsUp, FaHeart, FaSmile } from 'react-icons/fa';

const Feedback = () => {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the customer data from localStorage
      const customerData = localStorage.getItem('customerData');
      if (!customerData) {
        enqueueSnackbar('Please login to submit feedback', { variant: 'error' });
        navigate('/customer/login');
        return;
      }
      
      const { C_ID } = JSON.parse(customerData);
      const response = await axios.post('http://localhost:5555/api/feedback', { 
        message,
        customerId: C_ID,
        rating 
      });
      
      setMessage('');
      enqueueSnackbar('Feedback submitted successfully!', { variant: 'success' });
      navigate('/feedbackviews');
    } catch (error) {
      console.error('Error details:', error.response || error);
      enqueueSnackbar('Failed to submit feedback', { variant: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-sky-50">
      {/* Hero Section */}
      <div className="relative bg-sky-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Share Your Feedback</h1>
          <p className="text-xl text-sky-100 max-w-3xl mx-auto">
            Help us improve and create better experiences for you
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

        {/* Feedback Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-sky-800 mb-6">Your Opinion Matters</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <p className="text-lg font-medium text-gray-700">Your Rating:</p>
                <div className="flex space-x-2">
                  {[...Array(5)].map((star, index) => {
                    const ratingValue = index + 1;
                    return (
                      <label key={index} className="cursor-pointer">
                        <input 
                          type="radio" 
                          name="rating" 
                          value={ratingValue} 
                          checked={ratingValue === rating}
                          onChange={() => setRating(ratingValue)}
                          className="hidden"
                        />
                        <FaStar 
                          className="text-3xl transition-colors duration-200"
                          color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"} 
                          onMouseEnter={() => setHover(ratingValue)}
                          onMouseLeave={() => setHover(0)}
                        />
                      </label>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500">Selected Rating: {rating} of 5</p>
              </div>
              
              <div className="space-y-4">
                <label htmlFor="message" className="block text-lg font-medium text-gray-700">
                  Your Feedback
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your thoughts with us..."
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 min-h-[150px]"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition duration-300"
              >
                Submit Feedback
              </button>
            </form>
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
            <h2 className="text-3xl font-bold text-white mb-6">Want to See Other Reviews?</h2>
            <p className="text-sky-100 text-lg mb-8 max-w-2xl mx-auto">
              Check out what others are saying about their experiences with Bloomz Event Planning.
            </p>
            <Link 
              to="/feedbackviews" 
              className="inline-block bg-white text-sky-800 px-8 py-3 rounded-lg font-semibold hover:bg-sky-50 transition duration-300"
            >
              View All Reviews
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;