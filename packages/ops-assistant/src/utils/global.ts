import { useConversation } from '@aops-assistant/stores/conversation'

export function onHtmlEventDispatch(_t: any, _ty: any, event: any, type: any, data: any): void {
  if (type === 'execute') {
    const { sendQuestion } = useConversation()
    sendQuestion(data)
  }
}
