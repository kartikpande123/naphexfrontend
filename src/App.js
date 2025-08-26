import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import SignupPage from './components/Signup';
import Home from './components/Home';
import ForgotPassword from './components/Forgotpassword';
import PaymentGetway from './components/UserKyc';
import Game1 from "./components/Game1"
import UserProfile from './components/Users';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminOpenClose from './components/AdminOpenClose';
import AdminOpenCloseResults from './components/AdminOpenCloseResult';
import AdminWhoPlayOpenClose from './components/AdminWhoPlayOpenClose';
import AdminUserAmtPlayed from './components/AdminOpenCloseAmtPlayed';
import WinnersDetailsComponent from './components/AdminWinners';
import AdminProfitLoss from './components/AdminProfitLoss';
import AdminProfitLossChart from './components/AdminProfitLossChart';
import Game2 from './components/Game2';
import AdminBinary from './components/AdminBinary';
import NaphexHelpSection from './components/Help';
import AdminConcerns from './components/AdminConcerns';
import History from './components/History';
import MyAccount from './components/MyAccount';
import UserBinaryTree from './components/UerBinary';
import AdminBinaryTree from './components/AdminBinary';
import FriendsEarning from './components/FriendsEarning';
import BinaryDataTable from './components/AdminBinaryTable';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import Kycpolicy from './components/Kycpolicy';
import RulesAndRegulations from './components/GameRules';
import ResponsibleGaming from './components/Faqs';
import NaphexAbout from './components/AboutUs';
import AdminAcceptReject from './components/AdminAcceptReject';
import RejectedUsers from './components/AdminRejectedUsers';
import AdminBlockUnblock from './components/AdminBlockUnblock';
import AccountStatusCheck from './components/AccountStatusCheck';
import UserKyc from './components/UserKyc';
import EntryFees from './components/EntryFees';
import AddTokens from './components/AddTokens';
import Withdraw from './components/Withdraw';
import BankDetails from './components/BankDetails';
import AdminBankVarification from './components/AdminBankVarification';
import AdminWithdrawReq from './components/AdminWithdrawReq';
import AdminPaymentDashboard from './components/AdminPaymentDashboard';

// Protected Route Component for Users
const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem('authToken');

  if (!authToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Protected Route Component for Admin
const AdminProtectedRoute = ({ children }) => {
  const adminAuthToken = localStorage.getItem('adminAuthToken');

  if (!adminAuthToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path='/userkyc' element={<UserKyc />} />
           <Route path="/help" element={ <NaphexHelpSection /> } />
          <Route path="/" element={<AuthPage />} />
          <Route path='/forgotpassword' element={<ForgotPassword />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/terms&conditions" element={<TermsConditions />} />
          <Route path="/kycpolicy" element={<Kycpolicy />} />
          <Route path="/rules" element={<RulesAndRegulations />} />
          <Route path="/FAQs" element={<ResponsibleGaming />} />
          <Route path="/about" element={<NaphexAbout />} />
          <Route path="/statuscheck" element={<AccountStatusCheck />} />
          <Route path='/opencloseresult' element={<AdminOpenCloseResults />} />
          <Route path='/adminlogin' element={<AdminLogin />} />


          {/* ---------------------------------------------------------*/}

          {/* Protected Admin routes */}
          <Route path='/admindashboard' element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path='/adminopenclose' element={
            <AdminProtectedRoute>
              <AdminOpenClose />
            </AdminProtectedRoute>
          } />
          
          <Route path='/adminwhoplayopenclose' element={
            <AdminProtectedRoute>
              <AdminWhoPlayOpenClose />
            </AdminProtectedRoute>
          } />
          <Route path='/adminuseramtplayed' element={
            <AdminProtectedRoute>
              <AdminUserAmtPlayed />
            </AdminProtectedRoute>
          } />
          <Route path='/adminwinners' element={
            <AdminProtectedRoute>
              <WinnersDetailsComponent />
            </AdminProtectedRoute>
          } />
          <Route path='/adminprofit' element={
            <AdminProtectedRoute>
              <AdminProfitLoss />
            </AdminProtectedRoute>
          } />
          <Route path="/profitlosschart" element={
            <AdminProtectedRoute>
              <AdminProfitLossChart />
            </AdminProtectedRoute>
          } />
          <Route path="/binary" element={
            <AdminProtectedRoute>
              <AdminBinary />
            </AdminProtectedRoute>
          } />
          <Route path="/adminhelp" element={
            <AdminProtectedRoute>
              <AdminConcerns />
            </AdminProtectedRoute>
          } />
          <Route path="/adminbinarytree" element={
            <AdminProtectedRoute>
              <AdminBinaryTree />
            </AdminProtectedRoute>
          } />
          <Route path="/binarytable" element={
            <AdminProtectedRoute>
              <BinaryDataTable />
            </AdminProtectedRoute>
          } />
          <Route path="/adminacceptreject" element={
            <AdminProtectedRoute>
              <AdminAcceptReject />
            </AdminProtectedRoute>
          } />
          <Route path="/rejectedusers" element={
            <AdminProtectedRoute>
              <RejectedUsers />
            </AdminProtectedRoute>
          } />
          <Route path="/blockunblockusers" element={
            <AdminProtectedRoute>
              <AdminBlockUnblock />
            </AdminProtectedRoute>
          } />
          <Route path='/users' element={
            <AdminProtectedRoute>
              <UserProfile />
            </AdminProtectedRoute>
          } />
          <Route path='/adminbankverfication' element={
            <AdminProtectedRoute>
              <AdminBankVarification />
            </AdminProtectedRoute>
          } />
          <Route path='/adminwithdrawreq' element={
            <AdminProtectedRoute>
              <AdminWithdrawReq />
            </AdminProtectedRoute>
          } />
          <Route path='/adminpayment' element={
            <AdminProtectedRoute>
              <AdminPaymentDashboard />
            </AdminProtectedRoute>
          } />


          {/* ---------------------------------------------------------*/}

          {/* Protected user routes - require authentication */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path='/game1' element={
            <ProtectedRoute>
              <Game1 />
            </ProtectedRoute>
          } />
          <Route path='/game2' element={
            <ProtectedRoute>
              <Game2 />
            </ProtectedRoute>
          } />
          
         
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/Myaccount" element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          } />
          <Route path="/userbinary" element={
            <ProtectedRoute>
              <UserBinaryTree />
            </ProtectedRoute>
          } />
          <Route path="/earnings" element={
            <ProtectedRoute>
              <FriendsEarning />
            </ProtectedRoute>
          } />
          
          <Route path="/fees" element={
            <ProtectedRoute>
              <EntryFees />
            </ProtectedRoute>
          } />
          <Route path="/addtokens" element={
            <ProtectedRoute>
              <AddTokens />
            </ProtectedRoute>
          } />
          <Route path="/withdraw" element={
            <ProtectedRoute>
              <Withdraw />
            </ProtectedRoute>
          } />
          <Route path="/bankdetails" element={
            <ProtectedRoute>
              <BankDetails />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;