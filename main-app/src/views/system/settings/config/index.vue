<template>
  <div class="settings-container">
    <el-tabs v-model="activeTab" tab-position="left" class="settings-tabs">
      <el-tab-pane label="基础设置" name="basic">
        <div class="tab-header">
          <h2>基础设置</h2>
          <p class="desc">管理系统的名称、Logo及全局展示风格</p>
        </div>

        <el-form label-width="100px" style="max-width: 600px" @submit.prevent>
          <el-form-item label="系统名称">
            <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
          </el-form-item>

          <el-form-item label="系统 Logo">
            <el-upload
              class="logo-uploader"
              :show-file-list="false"
              :http-request="handleLogoUpload"
              accept="image/jpeg,image/png,image/svg+xml"
            >
              <img v-if="logoDisplayUrl" :src="logoDisplayUrl" class="logo-img" />
              <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="form-tip">建议尺寸 120x120px，支持 jpg、png、svg 格式</div>
          </el-form-item>

          <el-form-item label="默认主题色">
            <el-color-picker
              v-model="themeStore.themeColor"
              :predefine="predefineColors"
              @change="themeStore.updateThemeColor"
            />
          </el-form-item>

          <!-- <el-form-item label="导航布局">
            <el-radio-group v-model="basicForm.layout">
              <el-radio value="side">左侧菜单</el-radio>
              <el-radio value="top">顶部菜单</el-radio>
              <el-radio value="mix">混合菜单</el-radio>
            </el-radio-group>
          </el-form-item> -->

          <el-form-item>
            <el-button type="primary" @click="saveBasicSettings">保存更改</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="安全策略" name="security">
        <div class="tab-header">
          <h2>安全与密码策略</h2>
          <p class="desc">设置系统用户的密码复杂度及账号安全规则</p>
        </div>

        <el-form label-width="140px" style="max-width: 600px" @submit.prevent>
          <el-form-item label="初始默认密码">
            <el-input v-model="securityForm.defaultPassword" type="password" show-password />
          </el-form-item>

          <el-form-item label="最小密码长度">
            <el-input-number v-model="securityForm.minLength" :min="6" :max="32" />
          </el-form-item>

          <el-form-item label="密码复杂度要求">
            <el-checkbox-group v-model="securityForm.complexity">
              <el-checkbox value="uppercase">大写字母</el-checkbox>
              <el-checkbox value="lowercase">小写字母</el-checkbox>
              <el-checkbox value="number">数字</el-checkbox>
              <el-checkbox value="special">特殊字符</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="密码过期时间(天)">
            <el-input-number v-model="securityForm.expireDays" :min="0" :max="365" />
            <div class="form-tip">设为 0 表示密码永不过期</div>
          </el-form-item>

          <el-form-item label="最大登录失败次数">
            <el-input-number v-model="securityForm.maxFailures" :min="3" :max="10" />
            <div class="form-tip">超过次数后账号将自动锁定 30 分钟</div>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveSecuritySettings">保存策略</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { Plus } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import { useThemeStore } from '@/store/theme';
  import {
    getBasicSettings,
    updateBasicSettings,
    getSecuritySettings,
    updateSecuritySettings,
    uploadLogoApi,
    type BasicConfig,
    type SecurityConfig
  } from '@/api/settings';

  const activeTab = ref('basic');
  const loading = ref(false);
  const themeStore = useThemeStore();
  const baseURL = import.meta.env.VITE_BASE_URL || '';

  const basicForm = reactive<BasicConfig>({
    systemName: '',
    logo: '',
    themeColor: themeStore.themeColor,
    layout: 'side'
  });

  const predefineColors = ['#409eff', '#07c160', '#f5222d', '#fa541c', '#722ed1'];

  const logoDisplayUrl = computed(() => {
    const logo = basicForm.logo;
    if (!logo) return '';
    return logo.startsWith('http') ? logo : baseURL + logo;
  });

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (options: { file: File }) => {
    const { file } = options;
    try {
      const base64 = await readFileAsBase64(file);
      const data = await uploadLogoApi({ base64, filename: file.name });
      basicForm.logo = data?.url || '';
      ElMessage.success('Logo 上传成功');
    } catch (error) {
      console.error('Logo 上传失败', error);
      ElMessage.error('Logo 上传失败');
    }
  };

  const saveBasicSettings = async () => {
    try {
      loading.value = true;
      // 同步最新主题色并在提交时带上
      basicForm.themeColor = themeStore.themeColor;
      await updateBasicSettings(basicForm);
      ElMessage.success('基础设置保存成功');
      themeStore.updateThemeColor(basicForm.themeColor);
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  // --- 安全策略数据 ---
  const securityForm = reactive<SecurityConfig>({
    defaultPassword: '',
    minLength: 6,
    complexity: [],
    expireDays: 0,
    maxFailures: 5
  });

  const saveSecuritySettings = async () => {
    try {
      loading.value = true;
      await updateSecuritySettings(securityForm);
      ElMessage.success('安全策略更新成功');
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  // --- 初始化数据加载 ---
  const fetchData = async () => {
    try {
      loading.value = true;
      // 并行拉取两个 Tab 的数据
      const [basicRes, securityRes] = await Promise.all([
        getBasicSettings(),
        getSecuritySettings()
      ]);

      // 赋值回显到表单
      if (basicRes) {
        Object.assign(basicForm, basicRes);
        if (basicForm.themeColor) {
          themeStore.updateThemeColor(basicForm.themeColor);
        }
      }
      if (securityRes) Object.assign(securityForm, securityRes);
    } catch (error) {
      console.error('获取系统配置失败:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchData();
  });
</script>

<style scoped lang="scss">
  .settings-container {
    background-color: var(--el-bg-color);
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
    /* 确保在不同屏幕下有足够的高度 */
    min-height: calc(100vh - 120px);
  }

  /* 优化左侧 Tabs 的样式，使其更像后台设置面板 */
  :deep(.el-tabs--left .el-tabs__header.is-left) {
    margin-right: 0;
    border-right: 1px solid var(--el-border-color-light);
    padding: 20px 0;
    width: 200px; /* 固定左侧导航宽度 */
  }

  :deep(.el-tabs__item) {
    text-align: left;
    padding: 0 20px !important;
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    color: var(--el-text-color-regular);
  }

  :deep(.el-tabs__item.is-active) {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
  }

  :deep(.el-tabs--left .el-tabs__active-bar.is-left) {
    width: 3px;
    right: 0;
  }

  /* 右侧内容区 */
  :deep(.el-tabs__content) {
    padding: 30px 40px;
  }

  .tab-header {
    margin-bottom: 30px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding-bottom: 15px;

    h2 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .desc {
      margin: 0;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }

  /* Logo 上传框样式 */
  .logo-uploader {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .logo-uploader-icon {
    font-size: 28px;
    color: #8c939d;
  }

  .logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
    margin-top: 4px;
  }
</style>
