"use client";

import Link from "next/link";
import { ArrowRight, ShoppingCart, LayoutDashboard, ShieldCheck, Zap } from "lucide-react";
import { Header } from "@/components/header";
import { CONFIG } from "@/lib/config";
import { useUser } from "@/hooks/use-user";

export default function LandingPage() {
  const { data: user } = useUser();
  const isAdmin = user?.roles.includes("admin");
  const dashboardHref = isAdmin ? "/admin/dashboard" : "/dashboard";
  const portalHref = user ? dashboardHref : "/login";
  const signupHref = user ? dashboardHref : "/register";

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />

          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  New Version 2.0 is Live
                </div>

                <h1 className="text-5xl lg:text-7xl font-extrabold text-[#1A1A1A] leading-[1.1] mb-8 tracking-tight">
                  Seamless Ordering for{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">{CONFIG.BRAND_NAME}</span>
                </h1>

                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  The all-in-one portal designed exclusively for our partners. Track orders, manage inventory, and grow your business with ease.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href={portalHref}
                    className="group px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-lg transition-all shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                  >
                    {user ? "Go to Dashboard" : "Access Portal"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="#features"
                    className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-lg transition-all hover:bg-gray-50 flex items-center gap-2"
                  >
                    Learn More
                  </a>
                </div>

                <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-60 grayscale">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold tracking-tighter">Trusted By</span>
                    <span className="text-xs uppercase tracking-widest font-semibold">Top Retailers</span>
                  </div>
                  <div className="h-10 w-[1px] bg-gray-300 mx-2" />
                  <div className="flex gap-6">
                    <span className="font-bold text-gray-800">PARTNER+</span>
                    <span className="font-bold text-gray-800">GLOBAL</span>
                    <span className="font-bold text-gray-800">ELITE</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 relative">
                <div className="relative z-10 bg-white p-4 rounded-[2rem] shadow-2xl border border-gray-100 transform rotate-2 animate-float">
                  <div className="bg-gray-50 rounded-2xl p-6 aspect-[4/3] flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg mb-4 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-primary" />
                        </div>
                        <div className="h-4 w-20 bg-gray-100 rounded mb-2" />
                        <div className="h-6 w-12 bg-gray-200 rounded" />
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg mb-4 flex items-center justify-center">
                          <LayoutDashboard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="h-4 w-20 bg-gray-100 rounded mb-2" />
                        <div className="h-6 w-12 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="h-24 bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/2 bg-gray-100 rounded" />
                          <div className="h-3 w-1/3 bg-gray-50 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 blur-3xl -z-10 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">Everything you need to scale</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg text-balance">
                Our portal provides you with the professional tools required to streamline your business operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Smart Ordering",
                  description: "Inventory-aware ordering system that suggests quantities based on your history.",
                  icon: <ShoppingCart className="w-6 h-6" />,
                  color: "bg-primary/10 text-primary",
                },
                {
                  title: "Real-time Tracking",
                  description: "From warehouse to your doorstep, know exactly where your shipments are.",
                  icon: <Zap className="w-6 h-6" />,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  title: "Secure Access",
                  description: "Enterprise-grade security protecting your data and your transactions.",
                  icon: <ShieldCheck className="w-6 h-6" />,
                  color: "bg-emerald-50 text-emerald-600",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group p-10 rounded-[2.5rem] border border-gray-100 bg-white hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
                >
                  <div
                    className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform duration-500`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="bg-[#1A1A1A] rounded-[3rem] p-12 lg:p-20 relative overflow-hidden text-center">
              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">Ready to optimize your workflow?</h2>
                <p className="text-gray-400 text-lg">Join hundreds of partners who have already upgraded their ordering experience.</p>
                <Link
                  href={signupHref}
                  className="inline-flex px-10 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-xl transition-all hover:scale-[1.05] active:scale-95 shadow-2xl shadow-primary/20"
                >
                  {user ? "Go to Dashboard" : "Get Started Now"}
                </Link>
              </div>

              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-0" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] -z-0" />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold italic">{CONFIG.BRAND_SHORT}</span>
            </div>
            <span className="text-xl font-bold text-[#1A1A1A]">{CONFIG.BRAND_NAME}</span>
          </div>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {CONFIG.BRAND_NAME}. All rights reserved.
          </div>
          <div className="flex gap-8 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(2deg);
          }
          50% {
            transform: translateY(-20px) rotate(3deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
