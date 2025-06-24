"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Filter, Plus, Copy, Check } from "lucide-react";
import MentorLayout from "@/components/mentor/MentorLayout";
import ExpandableTraineeCard from "@/components/mentor/ExpandableTraineeCard";
import gsap from "gsap";
import { useSession } from "next-auth/react";

interface Trainee {
  id: string;
  user: {
    name: string;
    email: string;
    profileImage?: string;
  };
  institution?: string;
  graduationYear?: number;
  totalAttempts: number;
  averageScore: string;
  lastActivity: string;
  status: "active" | "inactive";
}

const MentorTraineesPage = () => {
  const { data: session } = useSession();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTraineeId, setExpandedTraineeId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [mentorCode, setMentorCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Refs for animations
  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const traineesGridRef = useRef<HTMLDivElement>(null);

  // Fetch trainees data
  useEffect(() => {
    fetchTrainees();
    fetchMentorCode();
  }, []);

  const fetchTrainees = async () => {
    try {
      const response = await fetch("/api/mentor/trainees");
      if (response.ok) {
        const data = await response.json();
        setTrainees(data);
        setFilteredTrainees(data);
      }
    } catch (error) {
      console.error("Failed to fetch trainees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMentorCode = async () => {
    try {
      const response = await fetch("/api/mentor/code");
      if (response.ok) {
        const data = await response.json();
        setMentorCode(data.mentorCode);
      }
    } catch (error) {
      console.error("Failed to fetch mentor code:", error);
    }
  };

  const generateNewCode = async () => {
    try {
      const response = await fetch("/api/mentor/code", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setMentorCode(data.mentorCode);
      }
    } catch (error) {
      console.error("Failed to generate new code:", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mentorCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Filter trainees based on search term
  useEffect(() => {
    const filtered = trainees.filter(
      (trainee) =>
        trainee.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.institution?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTrainees(filtered);
  }, [searchTerm, trainees]);

  // GSAP animations
  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (!headerRef.current || !searchRef.current || !traineesGridRef.current)
        return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Set initial states
      gsap.set(
        [headerRef.current, searchRef.current, traineesGridRef.current],
        {
          opacity: 0,
          y: 20,
        }
      );

      // Animate entrance
      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
      })
        .to(
          searchRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          "-=0.3"
        )
        .to(
          traineesGridRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          "-=0.3"
        );
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleToggleExpand = (traineeId: string) => {
    setExpandedTraineeId(expandedTraineeId === traineeId ? null : traineeId);
  };

  if (isLoading) {
    return (
      <MentorLayout currentPage="trainees">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-600 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout currentPage="trainees">
      <div className="space-y-6">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Trainees</h1>
            <p className="text-gray-300">
              Manage and monitor your trainees' progress
            </p>
          </div>

          {/* Mentor Code Section */}
          <div className="flex flex-col sm:flex-row gap-3">
            {mentorCode && (
              <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-sm">
                  <p className="text-gray-400">Your Mentor Code:</p>
                  <p className="text-white font-mono font-bold">{mentorCode}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="text-gray-400 hover:text-white"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
            <Button
              onClick={generateNewCode}
              className="bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate New Code
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div ref={searchRef} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search trainees by name, email, or institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
            />
          </div>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 hover:border-[#00cfb6]"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Stats Overview */}
        <div
          ref={traineesGridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Total Trainees
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {trainees.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Active Trainees
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {trainees.filter((t) => t.status === "active").length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Avg Performance
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {trainees.length > 0
                      ? Math.round(
                          trainees.reduce(
                            (acc, t) =>
                              acc +
                              Number.parseInt(t.averageScore.replace("%", "")),
                            0
                          ) / trainees.length
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#00cfb6]/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#00cfb6]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trainees Grid */}
        <div className="space-y-6">
          {filteredTrainees.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredTrainees.map((trainee) => (
                <div
                  key={trainee.id}
                  className={`${
                    expandedTraineeId === trainee.id
                      ? "col-span-full"
                      : "md:col-span-1 lg:col-span-1"
                  }`}
                >
                  <ExpandableTraineeCard
                    trainee={trainee}
                    isExpanded={expandedTraineeId === trainee.id}
                    onToggleExpand={() => handleToggleExpand(trainee.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full">
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    No trainees found
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm
                      ? "Try adjusting your search criteria"
                      : "No trainees have joined yet"}
                  </p>
                  {!searchTerm && mentorCode && (
                    <div className="bg-white/5 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-gray-300 text-sm mb-2">
                        Share your mentor code:
                      </p>
                      <div className="flex items-center justify-center space-x-2">
                        <code className="bg-white/10 px-3 py-1 rounded text-[#00cfb6] font-mono">
                          {mentorCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyToClipboard}
                          className="text-gray-400 hover:text-white"
                        >
                          {copied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MentorLayout>
  );
};

export default MentorTraineesPage;
