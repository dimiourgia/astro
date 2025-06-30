import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import RegistrationPage from "@/pages/registration";
import UserDetailsPage from "@/pages/user-details";
import BirthChartPage from "@/pages/birth-chart";
import ChatPage from "@/pages/chat";
import MainPage from "@/pages/main";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={RegistrationPage} />
      <Route path="/user-details/:phone">
        {({ phone }) => <UserDetailsPage phone={phone} />}
      </Route>
      <Route path="/birth-chart/:userId">
        {({ userId }) => <BirthChartPage userId={userId} />}
      </Route>
      <Route path="/chat/:userId/:botId">
        {({ userId, botId }) => <ChatPage userId={userId} botId={botId} />}
      </Route>
      <Route path="/main/:userId">
        {({ userId }) => <MainPage userId={userId} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen cosmic-gradient">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
