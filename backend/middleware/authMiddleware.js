import { verifyToken } from '../utils/jwtUtils.js';

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authentication required. Please provide a valid token.',
        details: 'Authorization header missing or malformed' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required. Please provide a valid token.',
        details: 'Token is empty'
      });
    }
    
    try {
      const decodedToken = verifyToken(token);
      
      // Attach user info to request object
      req.user = decodedToken;
      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return res.status(401).json({ 
        message: 'Invalid or expired token',
        details: tokenError.message
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      message: 'Authentication error',
      details: error.message
    });
  }
};

/**
 * Middleware to restrict access to admin users only
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

/**
 * Middleware to restrict access to customer users only
 */
export const isCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    res.status(403).json({ message: 'Customer access required' });
  }
};

/**
 * Middleware to ensure user can only access their own resources (or admin override)
 * @param {Function} idExtractor - Function to extract resource owner ID from request
 */
export const isOwnerOrAdmin = (idExtractor) => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      return next(); // Admins can access all resources
    }
    
    const resourceId = idExtractor(req);
    
    if (req.user.id === resourceId) {
      return next(); // Resource owner can access
    }
    
    res.status(403).json({ message: 'Access denied' });
  };
};
