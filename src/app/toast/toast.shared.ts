export enum ToastType { INFO, WARNING, ERROR, SUCCESS}

// class ToastMessage {
//   message = "Hi";
//   type: ToastType = ToastType.INFO;
// }

export interface ToastMessage {
  message: string;
  type: ToastType;
}
