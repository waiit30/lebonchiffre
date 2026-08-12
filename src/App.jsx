import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from '@/lib/cartStore';
import Layout from '@/components/Layout';
// Add page imports here
import Home from '@/pages/Home';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import Explication from '@/pages/Explication';
import AgentBackoffice from '@/pages/AgentBackoffice';
import Catalog from '@/pages/Catalog';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <CartProvider>
      <Routes>
        {/* Add your page Route elements here */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/produit/:id" element={<ProductDetail />} />
          <Route path="/panier" element={<Cart />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/explication" element={<Explication />} />
          <Route path="/gestion" element={<AgentBackoffice />} />
          <Route path="/recherche" element={<Catalog />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </CartProvider>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App