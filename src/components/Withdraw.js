import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from './ApiConfig';

function WithdrawTokens() {
  const storedUser = JSON.parse(localStorage.getItem('userData')) || {};
  const { name, phoneNo, tokens, beneficiaryId } = storedUser;

  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(beneficiaryId ? 'withdraw' : 'beneficiary');

  const [beneficiaryForm, setBeneficiaryForm] = useState({
    beneficiaryName: '',
    bankAccount: '',
    ifsc: '',
    vpa: '',
    email: '',
    phone: phoneNo || ''
  });

  const handleBeneficiarySubmit = async () => {
    if (!beneficiaryForm.beneficiaryName || !(beneficiaryForm.bankAccount && beneficiaryForm.ifsc) && !beneficiaryForm.vpa) {
      setMessage('Please enter necessary beneficiary details');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const payload = {
        beneficiary_id: phoneNo,
        beneficiary_name: beneficiaryForm.beneficiaryName,
        beneficiary_instrument_details: {
          bank_account_number: beneficiaryForm.bankAccount,
          bank_ifsc: beneficiaryForm.ifsc,
          vpa: beneficiaryForm.vpa
        },
        beneficiary_contact_details: {
          beneficiary_email: beneficiaryForm.email,
          beneficiary_phone: beneficiaryForm.phone,
          beneficiary_country_code: "+91"
        }
      };

      await axios.post(`${API_BASE_URL}/cashfree/create-beneficiary`, payload);
      // Save beneficiaryId in userData
      storedUser.beneficiaryId = phoneNo;
      localStorage.setItem('userData', JSON.stringify(storedUser));

      setStatus('success');
      setMessage('Beneficiary created! You can proceed to withdraw.');
      setStep('withdraw');
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || 'Failed to create beneficiary';
      setStatus('error');
      setMessage(errMsg);
    }
  };

  const handleWithdraw = async () => {
    if (!amount) {
      setMessage('Please enter amount');
      return;
    }
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setMessage('Enter a valid positive number');
      return;
    }
    if (amountNum > tokens) {
      setMessage('Insufficient tokens to withdraw');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const transferId = `wd_${Date.now()}`;
      const response = await axios.post(`${API_BASE_URL}/withdraw`, {
        phoneNo,
        amount: amountNum,
        transferId,
      });

      setStatus('success');
      setMessage(`Withdrawal initiated! Transfer ID: ${response.data.data.transfer_id}`);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error?.message || 'Withdrawal failed';
      setStatus('error');
      setMessage(errMsg);
    }
  };

  return (
    <div>
      <h2>{step === 'beneficiary' ? 'Setup Beneficiary' : 'Withdraw Tokens'}</h2>

      <p><strong>User:</strong> {name}</p>
      <p><strong>Phone:</strong> {phoneNo}</p>
      <p><strong>Tokens:</strong> {tokens}</p>

      {step === 'beneficiary' ? (
        <>
          <div>
            <label>Name:
              <input value={beneficiaryForm.beneficiaryName} onChange={e => setBeneficiaryForm({...beneficiaryForm, beneficiaryName: e.target.value})} />
            </label>
          </div>
          <div>
            <label>Bank Acc:
              <input value={beneficiaryForm.bankAccount} onChange={e => setBeneficiaryForm({...beneficiaryForm, bankAccount: e.target.value})} />
            </label>
            <label>IFSC:
              <input value={beneficiaryForm.ifsc} onChange={e => setBeneficiaryForm({...beneficiaryForm, ifsc: e.target.value})} />
            </label>
          </div>
          <div>
            <label>Or UPI:
              <input value={beneficiaryForm.vpa} onChange={e => setBeneficiaryForm({...beneficiaryForm, vpa: e.target.value})} />
            </label>
          </div>
          <div>
            <label>Email:
              <input value={beneficiaryForm.email} onChange={e => setBeneficiaryForm({...beneficiaryForm, email: e.target.value})} />
            </label>
          </div>
          <button onClick={handleBeneficiarySubmit} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Saving...' : 'Save Beneficiary'}
          </button>
        </>
      ) : (
        <>
          <div>
            <label>
              Withdraw Amount:
              <input
                type="number"
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={status === 'submitting'}
              />
            </label>
          </div>
          <button onClick={handleWithdraw} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Submitting...' : 'Withdraw'}
          </button>
        </>
      )}

      {message && <p style={{ color: status === 'error' ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}

export default WithdrawTokens;
