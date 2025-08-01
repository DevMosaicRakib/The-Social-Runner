import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center text-gray-600">
          <p className="flex items-center justify-center gap-2 text-sm">
            © 2025 The Social Runner. Built with 
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            for the running community.
          </p>
          <p className="text-xs mt-2 text-gray-500">
            All rights reserved. Connecting runners, one event at a time.
          </p>
        </div>
      </div>
    </footer>
  );
}