"use client";

import { useRef } from "react";
import Image from "next/image";
import { Linkedin, Mail } from "lucide-react";
// For React components
import { Swiper, SwiperSlide } from "swiper/react";

// For modules (note: no 'modules/' in path anymore)
import { FreeMode, Pagination, Navigation } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/navigation";

const teamMembers = [
  {
    name: "Dr. Aliaa Rehan",
    role: "Medical Director",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Orthopedic surgeon with 15 years of experience specializing in minimally invasive techniques.",
    linkedIn: "",
    email: "",
  },
  {
    name: "DR. Ahmad Al-Kabani",
    role: "Lead Medical Educator",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Professor of Surgery with expertise in developing surgical training curricula for medical students.",
    linkedIn: "",
    email: "",
  },
  {
    name: "Muhammad Sami",
    role: "Systems and Biomedical Engineer & Web Developer",
    image: "/images/Team/result.jpg",
    bio: "A biomedical engineer with a strong focus on full-stack web development. With a passion for merging engineering innovation and healthcare",
    linkedIn: "https://www.linkedin.com/in/muhammad-ms-sami/",
    email: "muhammadsamielbarawy@gmail.com",
  },
  {
    name: "Kareem Salah",
    role: "Systems and Biomedical Engineer & Blender & VR Developer",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Focuses on validating simulation effectiveness and implementing evidence-based training methods.",
    linkedIn: "",
    email: "",
  },
  {
    name: "Hager Samir",
    role: "Systems and Biomedical Engineer & VR Developer",
    image: "/images/Team/hager.jpeg",
    bio: "Experienced orthopedic surgeon who provides clinical insights and validates training scenarios.",
    linkedIn: "",
    email: "",
  },
  {
    name: "Sarah ElSaggan",
    role: "Systems and Biomedical Engineer & VR Developer",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Experienced orthopedic surgeon who provides clinical insights and validates training scenarios.",
    linkedIn: "",
    email: "",
  },
  {
    name: "Salma Ahmad",
    role: "Systems and Biomedical Engineer & VR Developer",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Experienced orthopedic surgeon who provides clinical insights and validates training scenarios.",
    linkedIn: "",
    email: "",
  },
];

export function TeamSection() {
  const swiperRef = useRef(null);

  return (
    <section id="team" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our interdisciplinary team combines expertise in medicine,
            education, and technology to create the most effective surgical
            training platform.
          </p>
        </div>

        <div className="relative" ref={swiperRef}>
          <Swiper
            breakpoints={{
              // when window width is >= 640px
              640: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              // when window width is >= 768px
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              // when window width is >= 1024px
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
              // when window width is >= 1280px
              1280: {
                slidesPerView: 4,
                spaceBetween: 30,
              },
            }}
            freeMode={true}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={true}
            modules={[FreeMode, Pagination, Navigation]}
            className="team-swiper"
          >
            {teamMembers.map((member, index) => (
              <SwiperSlide key={index}>
                <div className="bg-gray-800 rounded-xl overflow-hidden group hover:transform hover:scale-105 transition-all duration-400 h-full mx-4 md:mx-0">
                  <div className="relative h-80">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-cyan-400 mb-3">{member.role}</p>
                    <p className="text-gray-400 mb-4">{member.bio}</p>
                    <div className="flex space-x-3">
                      <a
                        href={member.linkedIn}
                        target="_blank"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Linkedin size={20} />
                      </a>
                      <a
                        href={`mailto:${member.email}`}
                        target="_blank"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Mail size={20} />
                      </a>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style jsx global>{`
        .team-swiper {
          padding-bottom: 60px !important;
        }
        .team-swiper .swiper-pagination-bullet {
          background: #00b09b;
          opacity: 0.5;
        }
        .team-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #00cfb6;
        }
        .team-swiper .swiper-button-next,
        .team-swiper .swiper-button-prev {
          color: #00cfb6;
        }
        .team-swiper .swiper-button-next:after,
        .team-swiper .swiper-button-prev:after {
          font-size: 24px;
        }
        .team-swiper .swiper-slide {
          height: auto;
        }
      `}</style>
    </section>
  );
}
