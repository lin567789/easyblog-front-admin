import { ElMessageBox } from 'element-plus'
const confirm = (message, okfun) => {
   ElMessageBox.confirm(
    message,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      draggable: true,
    }
  )
    .then(() => {
     okfun()
    })
    .catch(() => {})

}
 
export default confirm