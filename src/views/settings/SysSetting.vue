<template>
  <div>
    <el-form
      :model="formData"
      :rules="rules"
      :style="{ width: '50%' }"
      ref="formDataRef"
      label-width="200"
    >
      <el-form-item prop="openCommentType" label="是否开启评论/留言板">
        <el-radio-group v-model="formData.openCommentType">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="formData.openCommentType == 1">
        <el-form-item prop="changyanAppId" label="畅言appId">
          <el-input v-model="formData.changyanAppId"></el-input>
        </el-form-item>
        <el-form-item prop="changyanAppKey" label="畅言appKey">
          <el-input v-model="formData.changyanAppKey"></el-input>
        </el-form-item>
      </template>
      <el-form-item prop="gitPagesType" label="是否开启Git Pages">
        <el-radio-group v-model="formData.gitPagesType">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="formData.gitPagesType == 1"> </template>
      <el-form-item prop="showIcp" label="开启公安备案和ICP备案信息">
        <el-radio-group v-model="formData.showIcp">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="formData.showIcp == 1">
        <el-form-item prop="icpDomain" label="ICP备案域名">
          <el-input v-model="formData.icpDomain"></el-input>
        </el-form-item>
        <el-form-item prop="icpNo" label="ICP备案号">
          <el-input v-model="formData.icpNo"></el-input>
        </el-form-item>
        <el-form-item prop="policeProvince" label="公安备案省份">
          <el-select
            v-model="formData.policeProvince"
            clearable
            placeholder="请选择省份"
            :style="{ width: '100%' }"
          >
            <el-option
              v-for="(item, index) in provinceList"
              :value="item"
              :label="item"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="policeNo" label="公安备案号">
          <el-input v-model="formData.policeNo"></el-input>
        </el-form-item>
      </template>

      <el-form-item label="下载静态页面">
        <a href="javascript:void(0)" class="a-link" @click="createZip"
          >点击下载</a
        >
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="saveSysSetting">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
const { proxy } = getCurrentInstance()
const formData = ref({})
const formDataRef = ref(null)
const api = {
  createZip: '/sysSetting/createZip',
  saveSysSetting: '/sysSetting/saveSysSetting',
  getSysSetting: '/sysSetting/getSysSetting'
}
//校验规则
const rules = {
  openCommentType: [{ required: true, message: '请选择是否开启评论' }],
  changyanAppId: [{ required: true, message: '畅言appId不能为空' }],
  changyanAppKey: [{ required: true, message: '畅言appKey不能为空' }],
  gitPagesType: [{ required: true, message: '请选择是否开启Git Pages' }],
  showIcp: [{ required: true, message: '请选择是否开启' }],
  icpDomain: [{ required: true, message: 'ICP备案域名不能为空' }],
  icpNo: [{ required: true, message: 'ICP备案号不能为空' }],
  policeProvince: [{ required: true, message: '公安备案省份不能为空' }],
  policeNo: [{ required: true, message: '公安备案号不能为空' }]
}

const provinceList = [
  '京',
  '冀',
  '晋',
  '黑',
  '吉',
  '辽',
  '苏',
  '浙',
  '皖',
  '闽',
  '赣',
  '鲁',
  '豫',
  '鄂',
  '湘',
  '粤',
  '琼',
  '川',
  '贵',
  '云',
  '陕',
  '甘',
  '青',
  '台',
  '蒙',
  '桂',
  '藏',
  '宁',
  '新',
  '沪',
  '津',
  '渝',
  '港',
  '澳'
]

//获取系统设置
const getSysSetting = async () => {
  let result = await proxy.Request({
    url: api.getSysSetting
  })
  if (!result) {
    return
  }
  Object.assign(formData.value, result.data)
}
getSysSetting()
//保存系统设置
const saveSysSetting = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    const params = {}
    Object.assign(params, formData.value)
    let result = await proxy.Request({
      url: api.saveSysSetting,
      params: params
    })
    if (!result) {
      return
    }
    proxy.Message.success('保存成功')
  })
}

//下载静态页面
const createZip = async () => {
  let result = await proxy.Request({
    url: api.createZip
  })
  if (!result) {
    return
  }
  document.location.href =
    '/api/file/download/' + result.data + '/' + encodeURI('静态页面.zip')
}
</script>

<style lang="scss" scoped></style>
