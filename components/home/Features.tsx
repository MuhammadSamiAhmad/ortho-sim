import { BarChart2, Users, Headset, Gauge } from "lucide-react";

const features = [
  {
    icon: <Headset className="h-10 w-10 text-[#00cfb6]" />,
    title: "Immersive VR Experience",
    description:
      "Train in a realistic virtual operating room environment with accurate anatomical models and surgical instruments.",
  },
  {
    icon: <BarChart2 className="h-10 w-10 text-[#00cfb6]" />,
    title: "Performance Analytics",
    description:
      "Track your progress with detailed metrics on surgical precision, efficiency, and decision-making skills.",
  },
  {
    icon: <Users className="h-10 w-10 text-[#00cfb6]" />,
    title: "Mentor Feedback",
    description:
      "Experienced surgeons can provide personalized feedback and guidance on your simulation performance.",
  },
  {
    icon: <Gauge className="h-10 w-10 text-[#00cfb6]" />,
    title: "Real-time Assessment",
    description: "Get immediate feedback on your performance with scoring.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 bg-muted/50 flex items-center justify-center"
    >
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Advanced Features for Surgical Training
          </h2>
          <p className="mt-4 text-lg max-w-3xl mx-auto text-[#00cfb6]">
            OrthoSim combines cutting-edge VR technology with educational
            expertise to provide the most effective surgical training
            experience.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-[#0a1624] rounded-lg border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#3a66b8]">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
