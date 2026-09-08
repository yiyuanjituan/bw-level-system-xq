export interface registerProps {
  account: string;
  type: 'password' | 'sms';
  password: string;
  invite_code: string;
  sms_code: string;
  currency: string | number;
}

export interface loginProps {
  account: string;
  accountType: 'account' | 'phone';
  type: 'password' | 'sms';
  password: string;
  sms_code: string;
}
