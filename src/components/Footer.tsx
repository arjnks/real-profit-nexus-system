import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-realprofit-blue flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">RP</span>
              </div>
              <span className="text-lg font-bold text-realprofit-blue">Real Profit</span>
            </Link>
            <p className="text-gray-600 text-sm mb-4">
              Your one-stop supermarket for quality products and excellent customer service.
            </p>
            <div className="flex items-center text-gray-600 mb-2">
              <Mail className="h-4 w-4 mr-2" />
              <a href="mailto:werealprofit@gmail.com" className="text-sm hover:text-realprofit-blue">
                werealprofit@gmail.com
              </a>
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <Phone className="h-4 w-4 mr-2" />
              <span className="text-sm">+91 7306699370</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">123 Main Street, City - 680305</span>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">
              Membership
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/membership/bronze" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Bronze Membership
                </Link>
              </li>
              <li>
                <Link to="/membership/silver" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Silver Membership
                </Link>
              </li>
              <li>
                <Link to="/membership/gold" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Gold Membership
                </Link>
              </li>
              <li>
                <Link to="/membership/platinum" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Platinum Membership
                </Link>
              </li>
              <li>
                <Link to="/membership/diamond" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Diamond Membership
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">
              Customer Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-600 hover:text-realprofit-blue text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            &copy; {new Date().getFullYear()} Real Profit Supermarket. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
