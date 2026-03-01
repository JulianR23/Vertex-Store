import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCheckout } from './store/slices/checkout.slice';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import SummaryPage from './pages/SummaryPage';
import ResultPage from './pages/ResultPage';

const App = () => {
  const checkout = useSelector(selectCheckout);

  const hasProduct = checkout.selectedProduct !== null;
  const hasCard = checkout.card !== null;
  const hasTransaction = checkout.transaction !== null;

  return (
    <Routes>
      <Route path="/" element={<ProductPage />} />
      <Route
        path="/checkout"
        element={hasProduct ? <CheckoutPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/summary"
        element={hasCard ? <SummaryPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/result"
        element={hasTransaction ? <ResultPage /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;