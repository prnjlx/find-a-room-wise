import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Search, Home, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import heroImage from "@/assets/hero-bg.jpg";

export default function Index() {
  return (
    <div className="min-h-screen bg-[hsl(222_60%_12%)] text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222_70%_14%)] via-[hsl(218_65%_20%)] to-[hsl(210_70%_28%)] opacity-95" />
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Modern apartment interior"
            className="w-full h-full object-cover mix-blend-overlay opacity-25"
          />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect Room with <span className="text-[hsl(205_95%_75%)]">RoomEase</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Connect with room owners and seekers in a smart, intuitive platform. 
              Your next home is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 bg-[hsl(205_95%_70%)] text-[hsl(222_60%_12%)] hover:bg-[hsl(205_95%_78%)]">
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
                <Link to="/auth">
                  Browse Rooms
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose RoomEase?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We make finding and listing rooms simple, secure, and efficient
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-hover border-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
                <p className="text-muted-foreground">
                  Advanced filters to find exactly what you're looking for. Location, price, amenities - we've got you covered.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Home className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
                <p className="text-muted-foreground">
                  All room listings are verified to ensure quality and authenticity. Find your home with confidence.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
                <p className="text-muted-foreground">
                  Your data and privacy are our top priority. Secure authentication and encrypted communications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden shadow-elegant">
            <div className="bg-gradient-to-r from-primary to-secondary p-12 text-center">
              <div className="max-w-2xl mx-auto text-primary-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-lg mb-8 text-primary-foreground/90">
                  Join thousands of users finding their perfect rooms or listing their spaces
                </p>
                <Button size="lg" variant="secondary" asChild className="text-lg px-8">
                  <Link to="/auth">
                    Create Your Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                RoomEase
              </span>
            </div>
            <p className="text-muted-foreground">
              © 2024 RoomEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
