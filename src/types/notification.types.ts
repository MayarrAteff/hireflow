export type AppNotification = {
  id: string;
  user_id: string;
  /** An i18n key such as `notification.offerReceived`. */
  title: string;
  /** The values for that key's message, joined with "|". */
  body: string;
  /** An in-app path to open, e.g. `/candidate/offers/<id>`. */
  link: string | null;
  read_at: string | null;
  created_at: string;
};
