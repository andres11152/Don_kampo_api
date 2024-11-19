import { getConnection } from '../database/connection.js';
import { queries } from '../database/queries.interface.js';
import { sendEmail } from '../utils/mailer.js';  
import bcrypt from 'bcrypt';

export const requestPasswordReset = async (req, res) => {
  const { email, provider = 'gmail' } = req.body;

  try {
    const client = await getConnection();
    
    const result = await client.query(queries.users.getUserByEmail, [email]);
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ msg: 'Email not found' });
    }

    const userId = result.rows[0].id;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000);
    const expirationDateInSeconds = Math.floor(expirationDate.getTime() / 1000);

    await client.query(
      queries.users.updateUserResetToken,
      [verificationCode, expirationDateInSeconds, userId]
    );

    await sendEmail(
      email,  
      'Password Reset Code',  
      `Your password reset code is: ${verificationCode}`,  
      provider  
    );

    client.release();
    res.status(200).json({ msg: 'Verification code sent to email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const verifyCodeAndResetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const client = await getConnection();

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    const result = await client.query(
      queries.users.verifyUserResetCode, 
      [email, code, currentTimeInSeconds]
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(400).json({ msg: 'Invalid or expired code' });
    }

    const userId = result.rows[0].id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await client.query(
      queries.users.updateUserPassword,
      [hashedPassword, userId]
    );

    client.release();
    res.status(200).json({ msg: 'Password successfully reset' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
