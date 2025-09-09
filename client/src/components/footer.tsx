import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="text-primary text-2xl" />
              <span className="text-xl font-bold">FundingFinder</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your comprehensive platform for discovering PhD and Master's funding opportunities across the USA.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#latest" className="hover:text-white transition-colors">Latest Opportunities</a></li>
              <li><a href="#subjects" className="hover:text-white transition-colors">Browse by Subject</a></li>
              <li><a href="#subscribe" className="hover:text-white transition-colors">Subscribe</a></li>
              <li><a href="#admin" className="hover:text-white transition-colors">Admin Dashboard</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Application Tips</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Deadline Calendar</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Data Sources</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 FundingFinder. All rights reserved. Data is automatically collected from public sources and verified for accuracy.</p>
        </div>
      </div>
    </footer>
  );
}
