const express = require("express");
const router = new express.Router();
const messageController = require("../controllers/msgController");
const { handleErrors } = require("../utilities");
const validate = require("../utilities/message-validation");

router
  .get("/", handleErrors(messageController.buildInbox))
  .get(
    "/archive",
    handleErrors(messageController.buildArchivedMessages)
  )
  .get("/send", handleErrors(messageController.buildSendMessage))
  .post(
    "/send",
    validate.messageRules(),
    validate.checkMessageData,
    handleErrors(messageController.sendMessage)
  )
  .get("/view/:message_id", handleErrors(messageController.buildViewMessage))
  .get("/reply/:message_id", handleErrors(messageController.buildReplyMessage))
  .post(
    "/reply",
    validate.replyRules(),
    validate.checkReplyData,
    handleErrors(messageController.replyMessage)
  )
  .get("/read/:message_id", handleErrors(messageController.readMessage))
  .get("/archive/:message_id", handleErrors(messageController.archiveMessage))
  .get("/delete/:message_id", handleErrors(messageController.deleteMessage));

module.exports = router;
