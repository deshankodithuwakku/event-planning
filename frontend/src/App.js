// Add the new route for My Events
import MyEvents from './pages/customer/MyEvents';
import MyPayments from './pages/customer/MyPayments';

function App() {
  return (
    <Routes>
      {/* ...existing routes... */}
      <Route path="/customer/my-events" element={<MyEvents />} />
      <Route path="/customer/payments" element={<MyPayments />} />
      {/* ...existing routes... */}
    </Routes>
  );
}

export default App;
