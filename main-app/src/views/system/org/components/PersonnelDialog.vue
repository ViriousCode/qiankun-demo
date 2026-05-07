<template>
  <el-dialog
    :model-value="modelValue"
    title="配置用户"
    width="560px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form label-width="100px" class="personnel-dialog">
      <el-form-item label="组织名称">
        <el-input :model-value="personnelOrgName" disabled />
      </el-form-item>
      <el-form-item label="组织内用户">
        <template v-if="groupedUsers.inCurrentOrg.length">
          <el-checkbox-group v-model="userIds" class="personnel-checkbox-group">
            <el-checkbox v-for="u in groupedUsers.inCurrentOrg" :key="u.id" :value="u.id">
              {{ u.nickName || u.name }}
            </el-checkbox>
          </el-checkbox-group>
        </template>
        <span v-else class="empty-text">暂无组织内用户</span>
      </el-form-item>
      <el-form-item label="组织外用户">
        <el-checkbox-group v-model="userIds" class="personnel-checkbox-group">
          <el-checkbox
            v-for="u in groupedUsers.outOfOrg"
            :key="u.id"
            :value="u.id"
            :disabled="u.orgId != null && u.orgId !== groupedUsers.currentOrgId"
          >
            {{ u.nickName || u.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit')">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    modelValue: boolean;
    personnelOrgName: string;
    personnelOrgId?: number;
    userIds: number[];
    userOptions: {
      id: number;
      name: string;
      nickName: string;
      orgId?: number | null;
      orgName?: string;
    }[];
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'update:userIds': [value: number[]];
    submit: [];
  }>();

  const userIds = computed({
    get: () => props.userIds,
    set: (v) => emit('update:userIds', v)
  });

  const groupedUsers = computed(() => {
    const currentOrgId = props.personnelOrgId ?? null;
    const inCurrentOrg: typeof props.userOptions = [];
    const outOfOrg: typeof props.userOptions = [];

    (props.userOptions || []).forEach((u) => {
      if (currentOrgId != null && u.orgId === currentOrgId) inCurrentOrg.push(u);
      else outOfOrg.push(u);
    });

    return { currentOrgId, inCurrentOrg, outOfOrg };
  });
</script>

<style scoped lang="scss">
  .personnel-dialog {
    :deep(.el-form-item) {
      margin-bottom: 18px;
    }

    .personnel-checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 24px;

      :deep(.el-checkbox) {
        margin-right: 0;
        min-width: 110px;
      }
    }

    .empty-text {
      color: #909399;
      line-height: 32px;
    }
  }
</style>
