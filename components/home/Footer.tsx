import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer id="contact" className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Image
              src="/images/Logo.png"
              alt="Logo Footer"
              width={200}
              height={200}
            />
            <p className="text-gray-400 mb-4">
              Revolutionizing surgical education through immersive virtual
              reality training.
            </p>
            <div className="flex space-x-4">
              <a
                target="_blank"
                href="https://web.facebook.com/profile.php?id=100007452795778"
                className="text-gray-400 hover:text-cyan-500 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                target="_blank"
                href="https://x.com/11Muhammad_1"
                className="text-gray-400 hover:text-cyan-500 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                target="_blank"
                href="https://www.instagram.com/"
                className="text-gray-400 hover:text-cyan-500 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                target="_blank"
                href="https://www.linkedin.com/in/muhammad-ms-sami/"
                className="text-gray-400 hover:text-cyan-500 transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 mt-[80px]">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-cyan-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-gray-400 hover:text-cyan-500 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-gray-400 hover:text-cyan-500 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#team"
                  className="text-gray-400 hover:text-cyan-500 transition-colors"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-gray-400 hover:text-cyan-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 mt-[80px]">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-cyan-500 transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-cyan-500 transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 mt-[80px]">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-cyan-500 mr-3 flex-shrink-0 mt-1" />
                <span className="text-gray-400">
                  Cairo University, Faculty of Engineering, Cairo, Egypt
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-cyan-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">+20-106-065-4373</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-cyan-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">
                  muhammadsamielbarawy@gmail.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} ORTHO-SIM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
