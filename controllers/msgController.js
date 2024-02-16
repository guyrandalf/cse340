const msgModel = require("../models/message-model");
const utilities = require("../utilities/");
require("dotenv").config();

async function buildInbox(req, res, next) {
  let nav = await utilities.getNav();
  let inboxMessages = await utilities.getAccountMessages(
    res.locals.accountData.account_id
  );
  let archivedMessageCount = await msgModel.getArchivedMessageCountByAccountId(
    res.locals.accountData.account_id
  );
  res.render("inbox/inbox", {
    title: "Inbox",
    nav,
    archivedMessageCount,
    inboxMessages,
    errors: null,
  });
}

async function buildArchivedMessages(req, res, next) {
  let nav = await utilities.getNav();
  let archivedMessages = await utilities.getArchivedMessages(
    res.locals.accountData.account_id
  );
  res.render("inbox/archive", {
    title: "Inbox",
    nav,
    archivedMessages,
    errors: null,
  });
}

async function buildSendMessage(req, res, next) {
  let nav = await utilities.getNav();
  let accountSelect = await utilities.getAccountSelect();
  res.render("inbox/send", {
    title: "New Message",
    nav,
    errors: null,
    accountSelect,
  });
}

async function sendMessage(req, res) {
  let nav = await utilities.getNav();
  const { message_to, message_from, message_subject, message_body } = req.body;

  const regResult = await msgModel.sendNewMessage(
    message_to,
    message_from,
    message_subject,
    message_body
  );
  if (regResult) {
    let archivedMessageCount =
      await msgModel.getArchivedMessageCountByAccountId(
        res.locals.accountData.account_id
      );
    let inboxMessages = await utilities.getAccountMessages(
      res.locals.accountData.account_id
    );
    req.flash("success", `Your message was sent successfully.`);
    res.status(201).render("inbox/inbox", {
      title: "Inbox",
      nav,
      archivedMessageCount,
      inboxMessages,
      errors: null,
    });
  } else {
    let accountSelect = await utilities.getAccountSelect(message_to);
    req.flash("error", "Your message got lost in delivery.");
    // render account edit view again
    res.status(501).render("inbox/send", {
      title: "New Message",
      nav,
      accountSelect: accountSelect,
      message_from: message_from,
      message_subject: message_subject,
      message_body: message_body,
      errors: null,
    });
  }
}

async function buildViewMessage(req, res, next) {
  let message_id = parseInt(req.params.message_id);
  let message = await msgModel.getMessageById(message_id);
  let messageData = message.rows[0];
  let nav = await utilities.getNav();
  res.render("inbox/view", {
    title: `${messageData.message_subject}`,
    nav,
    errors: null,
    message_id: messageData.message_id,
    account_firstname: messageData.account_firstname,
    account_lastname: messageData.account_lastname,
    message_subject: messageData.message_subject,
    message_body: messageData.message_body,
  });
}

async function buildReplyMessage(req, res, next) {
  let message_id = parseInt(req.params.message_id);
  let message = await msgModel.getMessageById(message_id);
  let messageData = message.rows[0];
  let nav = await utilities.getNav();
  res.render("inbox/reply", {
    title: "Reply",
    nav,
    account_firstname: messageData.account_firstname,
    account_lastname: messageData.account_lastname,
    message_to: messageData.message_to,
    message_from: messageData.message_from,
    message_subject: messageData.message_subject,
    message_body: messageData.message_body,
    errors: null,
  });
}

async function replyMessage(req, res) {
  let nav = await utilities.getNav();
  const {
    message_to,
    message_from,
    message_subject,
    message_body,
    reply_message,
  } = req.body;
  const newSubject = `Re:${message_subject}`;
  const newMessageBody = `${message_body} Re:${reply_message}`;
  const regResult = await msgModel.sendNewMessage(
    message_from,
    message_to,
    newSubject,
    newMessageBody
  );
  if (regResult) {
    let archivedMessageCount =
      await msgModel.getArchivedMessageCountByAccountId(
        res.locals.accountData.account_id
      );
    let inboxMessages = await utilities.getAccountMessages(
      res.locals.accountData.account_id
    );
    req.flash("success", `Your reply was sent successfully.`);
    res.status(201).render("inbox/inbox", {
      title: "Inbox",
      nav,
      errors: null,
      archivedMessageCount,
      inboxMessages,
    });
  } else {
    req.flash("error", "Your reply got lost in delivery.");
    // render account edit view again
    res.status(501).render("inbox/reply", {
      title: "Reply",
      nav,
      account_firstname: account_firstname,
      account_lastname: account_lastname,
      message_to: message_to,
      message_from: message_from,
      message_subject: message_subject,
      message_body: message_body,
      reply_message: reply_message,
      errors: null,
    });
  }
}

async function readMessage(req, res, next) {
  let nav = await utilities.getNav();
  let message_id = parseInt(req.params.message_id);
  let regResult = await msgModel.readMessage(message_id);

  if (regResult) {
    let archivedMessageCount =
      await msgModel.getArchivedMessageCountByAccountId(
        res.locals.accountData.account_id
      );
    let inboxMessages = await utilities.getAccountMessages(
      res.locals.accountData.account_id
    );
    req.flash("success", "Message marked as read.");
    res.render("inbox/inbox", {
      title: "Inbox",
      nav,
      errors: null,
      archivedMessageCount,
      inboxMessages,
    });
  } else {
    let message = await msgModel.getMessageById(message_id);
    let messageData = message.rows[0];
    req.flash("error", "Mark as read failed.");
    // render view message view again
    res.status(501).render("inbox/view", {
      title: `${messageData.message_subject}`,
      nav,
      errors: null,
      message_id: messageData.message_id,
      account_firstname: messageData.account_firstname,
      account_lastname: messageData.account_lastname,
      message_subject: messageData.message_subject,
      message_body: messageData.message_body,
    });
  }
}

async function archiveMessage(req, res, next) {
  let nav = await utilities.getNav();
  let message_id = parseInt(req.params.message_id);
  let regResult = await msgModel.archiveMessage(message_id);

  if (regResult) {
    let archivedMessageCount =
      await msgModel.getArchivedMessageCountByAccountId(
        res.locals.accountData.account_id
      );
    let inboxMessages = await utilities.getAccountMessages(
      res.locals.accountData.account_id
    );
    req.flash("success", "Message moved to archive.");
    res.render("inbox/inbox", {
      title: "Inbox",
      nav,
      errors: null,
      archivedMessageCount,
      inboxMessages,
    });
  } else {
    let message = await msgModel.getMessageById(message_id);
    let messageData = message.rows[0];
    req.flash("error", "Message archive failed.");
    // render view message view again
    res.status(501).render("inbox/view", {
      title: `${messageData.message_subject}`,
      nav,
      errors: null,
      message_id: messageData.message_id,
      account_firstname: messageData.account_firstname,
      account_lastname: messageData.account_lastname,
      message_subject: messageData.message_subject,
      message_body: messageData.message_body,
    });
  }
}

async function deleteMessage(req, res, next) {
  let nav = await utilities.getNav();
  let message_id = parseInt(req.params.message_id);
  let regResult = await msgModel.deleteMessage(message_id);

  if (regResult) {
    let archivedMessageCount =
      await msgModel.getArchivedMessageCountByAccountId(
        res.locals.accountData.account_id
      );
    let inboxMessages = await utilities.getAccountMessages(
      res.locals.accountData.account_id
    );
    req.flash("success", "Message successfully deleted.");
    res.render("inbox/inbox", {
      title: "Inbox",
      nav,
      errors: null,
      archivedMessageCount,
      inboxMessages,
    });
  } else {
    let message = await msgModel.getMessageById(message_id);
    let messageData = message.rows[0];
    req.flash("error", "Message deletion failed.");
    // render view message view again
    res.status(501).render("inbox/view", {
      title: `${messageData.message_subject}`,
      nav,
      errors: null,
      message_id: messageData.message_id,
      account_firstname: messageData.account_firstname,
      account_lastname: messageData.account_lastname,
      message_subject: messageData.message_subject,
      message_body: messageData.message_body,
    });
  }
}

module.exports = {
  buildInbox,
  buildArchivedMessages,
  buildSendMessage,
  sendMessage,
  buildViewMessage,
  buildReplyMessage,
  replyMessage,
  readMessage,
  archiveMessage,
  deleteMessage,
};
