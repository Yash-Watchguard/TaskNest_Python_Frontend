export type comment = {
  comment_id: string;
  created_by: string;
  content: string;
  created_at:string
};

export type commentrequest = {
  content: string;
};

export type viewallcommentrespinse = {
  status: string;
  message: string;
  data: comment[];
};
