export function otpRequestNotice(data: { sent?: boolean; devCode?: string | null } | undefined): string {
  if (data?.devCode) {
    throw new Error('The server returned a development OTP instead of sending an SMS. The backend SMS provider must be configured.');
  }
  if (data?.sent !== true) {
    throw new Error('The server did not confirm an SMS request. If you are a new guest, choose “New guest? Register” first. Otherwise contact the stay team.');
  }
  return 'SMS request accepted. Enter the newest six-digit code when it arrives. If no SMS arrives, confirm you registered with this exact phone number or contact the stay team.';
}
