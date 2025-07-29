import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<Home />} />
          <Route path='/forgotpassword' element={<ForgotPassword />} />
          <Route path='/userkyc' element={<UserKyc />}/>
          <Route path='/game1' element={<Game1 />}/>
          <Route path='/game2' element={<Game2 />}/>
          <Route path='/users' element={<UserProfile />}/>
          <Route path='/adminlogin'element={<AdminLogin />}/>
          <Route path='/admindashboard'element={<AdminDashboard />}/>
          <Route path='/adminopenclose'element={<AdminOpenClose />}/>
          <Route path='/opencloseresult'element={<AdminOpenCloseResults />}/>
          <Route path='/adminwhoplayopenclose'element={<AdminWhoPlayOpenClose />}/>
          <Route path='/adminuseramtplayed' element={<AdminUserAmtPlayed />} />
          <Route path='/adminwinners' element={<WinnersDetailsComponent />} />
          <Route path='/adminprofit' element={<AdminProfitLoss />} />
          <Route path="/profitlosschart" element={<AdminProfitLossChart />} />
          <Route path="/binary" element={<AdminBinary />} />
          <Route path="/help" element={<NaphexHelpSection />} />
          <Route path="/adminhelp" element={<AdminConcerns />} />
          <Route path="/history" element={<History />} />
          <Route path="/Myaccount" element={<MyAccount />} />
          <Route path="/userbinary" element={<UserBinaryTree />} />
          <Route path="/adminbinarytree" element={<AdminBinaryTree />} />
          <Route path="/earnings" element={<FriendsEarning />} />
          <Route path="/binarytable" element={<BinaryDataTable />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/terms&conditions" element={<TermsConditions />} />
          <Route path="/kycpolicy" element={<Kycpolicy />} />
          <Route path="/rules" element={<RulesAndRegulations />} />
          <Route path="/FAQs" element={<ResponsibleGaming />} />
          <Route path="/about" element={<NaphexAbout />} />
          <Route path="/adminacceptreject" element={<AdminAcceptReject />} />
          <Route path="/rejectedusers" element={<RejectedUsers />} />
          <Route path="/blockunblockusers" element={<AdminBlockUnblock />} />
          <Route path="/statuscheck" element={<AccountStatusCheck />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
