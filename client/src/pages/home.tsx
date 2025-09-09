import Header from "@/components/header";
import Hero from "@/components/hero";
import Statistics from "@/components/statistics";
import LatestOpportunities from "@/components/latest-opportunities";
import ScholarshipJourney from "@/components/scholarship-journey";
import SubjectCategories from "@/components/subject-categories";
import SubscriptionForm from "@/components/subscription-form";
import AdminDashboard from "@/components/admin-dashboard";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <Statistics />
      <LatestOpportunities />
      <ScholarshipJourney />
      <SubjectCategories />
      <SubscriptionForm />
      <AdminDashboard />
      <Footer />
    </div>
  );
}
