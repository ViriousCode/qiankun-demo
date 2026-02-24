<template>
  <div class="err-container">
    <div class="err-content">
      <h1 class="err-code">403</h1>
      <h2 class="err-title">抱歉，您没有权限访问该页面</h2>
      <p class="err-desc">当前账号权限不足，请联系管理员分配权限，或尝试切换账号。</p>

      <div class="err-actions">
        <button @click="goHome" class="btn-primary">返回首页</button>
        <button @click="back" class="btn-ghost">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const goHome = () => {
    // 如果在 qiankun 环境，建议跳转到主应用首页
    router.push('/');
  };

  const back = () => {
    router.go(-1);
  };
</script>

<style scoped>
  .err-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f3f4f6;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  .err-content {
    text-align: center;
    padding: 2rem;
  }

  .err-code {
    font-size: 8rem;
    font-weight: 900;
    color: #3b82f6;
    margin: 0;
    line-height: 1;
  }

  .err-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1f2937;
    margin-top: 1.5rem;
  }

  .err-desc {
    font-size: 1.125rem;
    color: #6b7280;
    margin-top: 1rem;
    max-width: 28rem;
  }

  .err-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2.5rem;
  }

  .btn-primary {
    padding: 0.75rem 1.5rem;
    background-color: #3b82f6;
    color: white;
    border-radius: 0.5rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn-primary:hover {
    background-color: #2563eb;
  }

  .btn-ghost {
    padding: 0.75rem 1.5rem;
    background-color: transparent;
    color: #4b5563;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-ghost:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
</style>
