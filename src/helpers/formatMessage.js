function formatMessage({
  type,
  sender,
  content,
  roomId,
  timestamp = new Date(),
  ...rest
}) {
  return JSON.stringify({ type, sender, content, roomId, timestamp, ...rest });
}
