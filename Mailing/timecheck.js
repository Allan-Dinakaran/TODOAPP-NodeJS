const cron = require('node-cron');
const mailer = require('nodemailer');
const User = require('../Database/user');
const task = require('../Database/schema');
const mongoose = require('mongoose');

const target_time = '53 22 * * *';

cron.schedule(target_time, async () => {
  console.log("Starting Check");

  try {
    const systemSettings = await mongoose.connection.db.collection('settings').findOne({ type: "email_config" });

    if (!systemSettings || !systemSettings.email || !systemSettings.emailPassword) {
      console.error("Master app email credentials not found in 'settings' collection.");
      return; 
    }

    const transporter = mailer.createTransport({
      service: 'gmail',
      auth: {
        user: systemSettings.email,         
        pass: systemSettings.emailPassword, 
      },
    });

    const users = await User.find({});

    for (const user of users) {
      if (!user.email) continue; 

      const userTasks = await task.find({ user: user._id });

      if (userTasks.length === 0) continue; 

      const incomplete = userTasks.filter(t => !t.Completed);
      const completed = userTasks.filter(t => t.Completed);

      if (incomplete.length === 0) {
        console.log(`All tasks completed for ${user.email}. No email required today.`);
        continue;
      }

      let incompleteList = '';
      let completedList = '';

      for (const t of userTasks) {
        if (t.Completed) {
          completedList += ` ${t.taskname}\n`;
        } else {
          incompleteList += `• ${t.taskname} - ${t.Description || 'No description'}\n`;
        }
      }

      if (completedList === '') {
        completedList = 'None';
      }

      const mailOptions = {
        from: `"Task Manager Support" <${systemSettings.email}>`, 
        to: user.email, 
        subject: `Daily Mail: ${incomplete.length} Tasks Remaining`,
        html: `
          <h3>Daily Task Summary</h3>
          <h4>Incomplete Items (${incomplete.length}):</h4>
          <pre>${incompleteList}</pre>
          <h4>Completed Items (${completed.length}):</h4>
          <pre>${completedList}</pre>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Progress summary successfully sent to: ${user.email}`);
      } catch (sendError) {
        console.error(`Failed sending mail to ${user.email}:`, sendError.message);
      }
    } 
  } catch (error) {
    console.error('Email system error:', error);
  }
});