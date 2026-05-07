<template>
  <div class="page-container">
    <h2 class="page-title">表单设计器</h2>
    <div class="page-card">
      <div class="page-head">
        <div class="page-subtitle">{{ isEdit ? '编辑表单' : '新建表单' }}</div>
        <div class="page-actions">
          <el-button @click="goBack">返回</el-button>
          <el-button @click="exportSchemaJson">导出 JSON</el-button>
          <el-button @click="triggerImportSchemaJson">导入 JSON</el-button>
          <el-button @click="openSchemaJsonPreview">查看 JSON</el-button>
          <input ref="importInputRef" type="file" accept="application/json,.json" style="display: none"
            @change="onImportSchemaJson" />
          <el-button type="primary" :loading="saving" @click="save">保存</el-button>
        </div>
      </div>

      <div>
        <el-form ref="baseFormRef" :model="base" :rules="baseRules" label-width="60px">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="名称" prop="name">
                <el-input v-model="base.name" placeholder="请输入表单名称" />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="编码" prop="code">
                <el-input v-model="base.code" placeholder="例如 customer_info" />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="状态">
                <el-select v-model="base.status">
                  <el-option :value="1" label="启用" />
                  <el-option :value="0" label="禁用" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="designer-grid">
        <el-card shadow="never" class="panel-card palette-panel">
          <template #header>组件</template>

          <el-input v-model="paletteKeyword" placeholder="搜索组件（名称 / 类型）" clearable class="palette-search" />

          <div class="palette-scroll">
            <div class="palette-section">
              <div class="palette-section-title">Element</div>
              <Draggable :list="elementPalette" item-key="type" :group="{ name: 'fb', pull: 'clone', put: false }"
                :sort="false" :clone="clonePalette" class="palette-grid">
                <template #item="{ element }">
                  <div class="palette-item">
                    <div class="palette-title">{{ element.title }}</div>
                  </div>
                </template>
              </Draggable>
            </div>

            <div class="palette-section">
              <div class="palette-section-title">其他</div>
              <Draggable :list="otherPalette" item-key="type" :group="{ name: 'fb', pull: 'clone', put: false }"
                :sort="false" :clone="clonePalette" class="palette-grid">
                <template #item="{ element }">
                  <div class="palette-item">
                    <div class="palette-title">{{ element.title }}</div>
                  </div>
                </template>
              </Draggable>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="panel-card canvas-panel">
          <template #header>画布</template>
          <el-tabs v-model="centerTab" class="center-tabs">
            <el-tab-pane label="字段" name="fields">
              <div class="canvas-toolbar">
                <el-button :disabled="!canUndo" @click="undo">撤销</el-button>
                <el-button :disabled="!canRedo" @click="redo">重做</el-button>
                <el-input v-model="canvasKeyword" clearable style="width: 240px" placeholder="搜索字段（标题 / field / 类型）" />
                <div class="canvas-toolbar-spacer" />
                <el-button @click="openCreateGroupDialog">新建分组</el-button>
                <el-button :disabled="!publishedSchema || publishedSchema.length === 0" @click="openDiff">
                  查看差异
                </el-button>
                <el-button :disabled="!currentField" @click="duplicateSelected">复制字段</el-button>
                <el-button :disabled="!currentField" @click="moveSelected(-1)">上移</el-button>
                <el-button :disabled="!currentField" @click="moveSelected(1)">下移</el-button>
                <el-dropdown trigger="click" :disabled="selectedCount === 0">
                  <el-button>批量（{{ selectedCount }}）</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :disabled="selectedCount === 0" @click="batchRemoveSelected">
                        批量移除
                      </el-dropdown-item>
                      <el-dropdown-item :disabled="selectedCount === 0" @click="batchSetDisabled(true)">
                        批量禁用
                      </el-dropdown-item>
                      <el-dropdown-item :disabled="selectedCount === 0" @click="batchSetDisabled(false)">
                        批量启用
                      </el-dropdown-item>
                      <el-dropdown-item divided :disabled="selectedCount === 0" @click="batchSetSpan">
                        批量设置占用列
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-dropdown trigger="click" :disabled="!currentField">
                  <el-button>更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :disabled="!currentField" @click="moveSelectedTo('top')">
                        置顶
                      </el-dropdown-item>
                      <el-dropdown-item :disabled="!currentField" @click="moveSelectedTo('bottom')">
                        置底
                      </el-dropdown-item>
                      <el-dropdown-item divided :disabled="!currentField" @click="removeSelected">
                        移除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <el-alert v-if="qualityIssues.length > 0" class="quality-alert"
                :type="qualityHasError ? 'error' : 'warning'" :title="`质量检查：发现 ${qualityIssues.length} 个问题`" show-icon
                :closable="false">
                <template #default>
                  <div class="quality-list">
                    <div v-for="(it, idx) in qualityIssues" :key="idx" class="quality-item">
                      <el-tag v-if="it.level === 'error'" type="danger" size="small">错误</el-tag>
                      <el-tag v-else type="warning" size="small">警告</el-tag>
                      <el-link v-if="it.uid" type="primary" :underline="false" @click.prevent="focusIssue(it)">
                        {{ it.message }}
                      </el-link>
                      <span v-else class="quality-text">{{ it.message }}</span>
                    </div>
                  </div>
                </template>
              </el-alert>

              <div class="canvas-dropzone">
                <div v-if="schema.length === 0" class="canvas-empty">
                  从左侧拖拽组件到这里开始设计。
                </div>
                <div v-else-if="canvasKeyword.trim() && canvasVisibleCount === 0" class="canvas-empty">
                  没有匹配的字段，请调整搜索关键词。
                </div>

                <div v-if="groupedCanvas[0]" class="canvas-group">
                  <div class="canvas-group-head">
                    <div class="canvas-group-title">
                      <span class="canvas-group-name">{{ groupedCanvas[0].title }}</span>
                      <span class="canvas-group-count">{{ groupedCanvas[0].visibleCount }}/{{
                        groupedCanvas[0].totalCount
                      }}</span>
                    </div>
                  </div>
                  <div class="canvas-group-body">
                    <Draggable v-model="canvasBuckets[UNGROUPED_ID]" item-key="uid" :animation="150"
                      :group="{ name: 'fb', pull: true, put: true }" class="canvas-list" @end="onDragEnd">
                      <template #item="{ element }">
                        <DesignerCanvasItem :field="element" :visible="canvasItemVisible(element)"
                          :is-active="selectedUid === element.uid" :is-selected="isSelected(element.uid)"
                          @select="onCanvasItemClick($event, element.uid)" @remove="removeFieldByUid(element.uid)" />
                      </template>
                    </Draggable>
                  </div>
                </div>

                <Draggable v-model="canvasGroups" item-key="id" :animation="150" class="canvas-groups"
                  :group="{ name: 'fb_groups', pull: false, put: false }" handle=".canvas-group-drag-handle"
                  @end="onGroupDragEnd">
                  <template #item="{ element: g }">
                    <div class="canvas-group">
                      <div class="canvas-group-head" :class="{ 'is-collapsed': Boolean(g.collapsed) }">
                        <div class="canvas-group-title" @click="toggleGroupCollapsed(g.id)">
                          <span class="canvas-group-drag-handle" @click.stop>⋮⋮</span>
                          <span class="canvas-group-arrow">
                            {{ g.collapsed ? '▶' : '▼' }}
                          </span>
                          <span class="canvas-group-name">{{ g.title }}</span>
                          <span class="canvas-group-count">
                            {{ groupVisibleCountMap[g.id] || 0 }}/{{ (canvasBuckets[g.id] || []).length }}
                          </span>
                        </div>
                        <el-dropdown trigger="click">
                          <el-button link @click.stop>⋯</el-button>
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item @click="openRenameGroupDialog(g.id, g.title)">
                                重命名
                              </el-dropdown-item>
                              <el-dropdown-item divided @click="removeGroup(g.id)">删除分组</el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </div>

                      <div v-show="!g.collapsed" class="canvas-group-body">
                        <Draggable v-model="canvasBuckets[g.id]" item-key="uid" :animation="150"
                          :group="{ name: 'fb', pull: true, put: true }" class="canvas-list" @end="onDragEnd">
                          <template #item="{ element }">
                            <DesignerCanvasItem :field="element" :visible="canvasItemVisible(element)"
                              :is-active="selectedUid === element.uid" :is-selected="isSelected(element.uid)"
                              @select="onCanvasItemClick($event, element.uid)"
                              @remove="removeFieldByUid(element.uid)" />
                          </template>
                        </Draggable>
                      </div>
                    </div>
                  </template>
                </Draggable>
              </div>
            </el-tab-pane>

            <el-tab-pane label="预览" name="preview">
              <div class="preview-scroll">
                <FormRenderer ref="previewRendererRef" :schema="schema" v-model="previewModel"
                  :cross-field-rules="parsedCrossFieldRules" />
                <div style="margin-top: 10px; display: flex; justify-content: flex-end">
                  <el-button type="primary" @click="validatePreview">校验预览</el-button>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <el-card shadow="never" class="panel-card prop-panel">
          <template #header>属性</template>
          <div v-if="!currentField" class="prop-empty">请选择画布中的字段。</div>
          <template v-else>
            <el-form :model="currentField" label-width="90px">
              <DesignerBasicPropsPanel :field="currentField" :canvas-groups="canvasGroups"
                :supports-placeholder="supportsPlaceholder" :supports-text-length="supportsTextLength"
                :supports-number-range="supportsNumberRange" :supports-pattern="supportsPattern"
                :supports-options="supportsOptions" :pattern-presets="patternPresets" :data-source-text="dataSourceText"
                :data-source-json-error="dataSourceJsonError" :cascader-options-text="cascaderOptionsText"
                :cascader-json-error="cascaderJsonError" @update-group-id="updateCurrentFieldGroupId"
                @update-field="applyCurrentFieldPatch" @pattern-preset-change="handlePatternPresetChange"
                @data-source-type-change="handleDataSourceTypeChange" @update:data-source-text="updateDataSourceText"
                @format-data-source="formatDataSource" @add-option="addOption" @remove-option="removeOption"
                @update:cascader-options-text="updateCascaderOptionsText"
                @format-cascader-options="formatCascaderOptions" />

              <DesignerAdvancedPropsPanel :field="currentField" :cross-field-info-icon-url="crossFieldInfoIconUrl"
                :current-linkage-field-options="currentLinkageFieldOptions" :condition-ops="conditionOps"
                :component-props-text="componentPropsText" :component-props-json-error="componentPropsJsonError"
                @update-field="applyCurrentFieldPatch" @update:component-props-text="updateComponentPropsText"
                @format-component-props="formatComponentProps" />

              <el-collapse class="advanced-collapse">
                <DesignerCrossRulesPanel :rules="crossFieldRules" :advanced="crossFieldAdvanced"
                  :advanced-collapse="crossFieldAdvancedCollapse" :rules-text="crossFieldRulesText"
                  :rules-json-error="crossFieldJsonError" :cross-field-info-icon-url="crossFieldInfoIconUrl"
                  :cross-field-field-options="crossFieldFieldOptions" :condition-ops="conditionOps"
                  @update:rules="updateCrossFieldRules" @update:advanced="updateCrossFieldAdvanced"
                  @update:advanced-collapse="updateCrossFieldAdvancedCollapse"
                  @update:rules-text="updateCrossFieldRulesText" />
              </el-collapse>
            </el-form>
          </template>
        </el-card>
      </div>
    </div>
  </div>

  <el-drawer v-model="diffOpen" title="草稿 vs 已发布 差异" size="520px">
    <div class="diff-meta">
      <el-text type="info" size="small">
        已发布版本时间：{{ publishedAt || '（无）' }}
      </el-text>
    </div>

    <template v-if="!diffHasAny">
      <el-empty description="暂无差异" />
    </template>
    <template v-else>
      <el-collapse>
        <el-collapse-item title="新增字段" name="added">
          <div v-if="diffAdded.length === 0" class="diff-empty">无</div>
          <div v-for="it in diffAdded" :key="it.key" class="diff-row">
            <el-tag type="success" size="small">新增</el-tag>
            <span class="diff-key">{{ it.key }}</span>
            <span class="diff-label">{{ it.label }}</span>
          </div>
        </el-collapse-item>
        <el-collapse-item title="删除字段" name="removed">
          <div v-if="diffRemoved.length === 0" class="diff-empty">无</div>
          <div v-for="it in diffRemoved" :key="it.key" class="diff-row">
            <el-tag type="danger" size="small">删除</el-tag>
            <span class="diff-key">{{ it.key }}</span>
            <span class="diff-label">{{ it.label }}</span>
          </div>
        </el-collapse-item>
        <el-collapse-item title="分组变更" name="groups">
          <div class="diff-section-title">新增分组</div>
          <div v-if="diffGroupAdded.length === 0" class="diff-empty">无</div>
          <div v-for="g in diffGroupAdded" :key="g.id" class="diff-row">
            <el-tag type="success" size="small">新增</el-tag>
            <span class="diff-key">{{ g.id }}</span>
            <span class="diff-label">{{ g.title }}</span>
          </div>

          <div class="diff-section-title" style="margin-top: 10px">删除分组</div>
          <div v-if="diffGroupRemoved.length === 0" class="diff-empty">无</div>
          <div v-for="g in diffGroupRemoved" :key="g.id" class="diff-row">
            <el-tag type="danger" size="small">删除</el-tag>
            <span class="diff-key">{{ g.id }}</span>
            <span class="diff-label">{{ g.title }}</span>
          </div>

          <div class="diff-section-title" style="margin-top: 10px">字段分组调整</div>
          <div v-if="diffFieldMoved.length === 0" class="diff-empty">无</div>
          <div v-for="m in diffFieldMoved" :key="m.field" class="diff-row diff-row--wrap">
            <el-tag type="warning" size="small">调整</el-tag>
            <span class="diff-key">{{ m.field }}</span>
            <span class="diff-label">{{ m.label }}</span>
            <span class="diff-move">
              {{ m.fromTitle }} → {{ m.toTitle }}
            </span>
          </div>
        </el-collapse-item>
      </el-collapse>
    </template>
  </el-drawer>

  <el-dialog v-model="schemaJsonPreviewOpen" title="当前表单 JSON" width="860px" destroy-on-close>
    <el-input :model-value="schemaJsonPreview" type="textarea" :rows="20" readonly resize="none"
      style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" />
    <template #footer>
      <el-button @click="schemaJsonPreviewOpen = false">关闭</el-button>
    </template>
  </el-dialog>

  <el-dialog
    v-model="createGroupDialogOpen"
    title="新建分组"
    width="480px"
    destroy-on-close
    @closed="resetCreateGroupDialog"
  >
    <el-input
      v-model="createGroupTitle"
      placeholder="请输入分组名称"
      clearable
      @keyup.enter="confirmCreateGroup"
    />
    <template #footer>
      <el-button @click="createGroupDialogOpen = false">取消</el-button>
      <el-button type="primary" @click="confirmCreateGroup">确定</el-button>
    </template>
  </el-dialog>

  <el-dialog
    v-model="renameGroupDialogOpen"
    title="重命名分组"
    width="480px"
    destroy-on-close
    @closed="resetRenameGroupDialog"
  >
    <el-input
      v-model="renameGroupTitle"
      placeholder="请输入新的分组名称"
      clearable
      @keyup.enter="confirmRenameGroup"
    />
    <template #footer>
      <el-button @click="renameGroupDialogOpen = false">取消</el-button>
      <el-button type="primary" @click="confirmRenameGroup">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import Draggable from 'vuedraggable';
import FormRenderer from '../components/FormRenderer.vue';
import DesignerCanvasItem from './DesignerCanvasItem.vue';
import DesignerBasicPropsPanel from './DesignerBasicPropsPanel.vue';
import DesignerAdvancedPropsPanel from './DesignerAdvancedPropsPanel.vue';
import DesignerCrossRulesPanel from './DesignerCrossRulesPanel.vue';
import { useDesignerPageState } from './useDesignerPageState';

const {
  isEdit,
  base,
  baseFormRef,
  baseRules,
  schema,
  selectedUid,
  saving,
  centerTab,
  previewModel,
  previewRendererRef,
  paletteKeyword,
  canvasKeyword,
  importInputRef,
  crossFieldRules,
  canvasGroups,
  publishedSchema,
  publishedAt,
  crossFieldJsonError,
  crossFieldAdvanced,
  crossFieldAdvancedCollapse,
  crossFieldInfoIconUrl,
  UNGROUPED_ID,
  canvasBuckets,
  groupVisibleCountMap,
  groupedCanvas,
  canUndo,
  canRedo,
  undo,
  redo,
  elementPalette,
  otherPalette,
  clonePalette,
  parsedCrossFieldRules,
  qualityIssues,
  qualityHasError,
  focusIssue,
  canvasItemVisible,
  canvasVisibleCount,
  isSelected,
  selectedCount,
  currentField,
  updateCurrentFieldGroupId,
  applyCurrentFieldPatch,
  onCanvasItemClick,
  removeFieldByUid,
  toggleGroupCollapsed,
  createGroupByTitle,
  renameGroupByIdTitle,
  removeGroup,
  updateCrossFieldRules,
  updateCrossFieldAdvanced,
  updateCrossFieldAdvancedCollapse,
  updateCrossFieldRulesText,
  supportsOptions,
  supportsPlaceholder,
  supportsPattern,
  supportsTextLength,
  supportsNumberRange,
  dataSourceJsonError,
  handleDataSourceTypeChange,
  conditionOps,
  currentLinkageFieldOptions,
  patternPresets,
  handlePatternPresetChange,
  cascaderJsonError,
  cascaderOptionsText,
  formatCascaderOptions,
  updateCascaderOptionsText,
  componentPropsText,
  componentPropsJsonError,
  formatComponentProps,
  updateComponentPropsText,
  addOption,
  removeOption,
  onDragEnd,
  onGroupDragEnd,
  diffOpen,
  diffHasAny,
  diffAdded,
  diffRemoved,
  diffGroupAdded,
  diffGroupRemoved,
  diffFieldMoved,
  openDiff,
  save,
  goBack,
  exportSchemaJson,
  triggerImportSchemaJson,
  onImportSchemaJson,
  crossFieldRulesText,
  validatePreview,
  dataSourceText,
  formatDataSource,
  updateDataSourceText,
  batchRemoveSelected,
  batchSetDisabled,
  batchSetSpan,
  removeSelected,
  moveSelected,
  moveSelectedTo,
  duplicateSelected,
  crossFieldFieldOptions
} = useDesignerPageState();

const schemaJsonPreviewOpen = ref(false);
const createGroupDialogOpen = ref(false);
const createGroupTitle = ref('');
const renameGroupDialogOpen = ref(false);
const renameGroupTitle = ref('');
const renamingGroupId = ref('');

const schemaJsonPreview = computed(() =>
  JSON.stringify(
    {
      name: base.value.name,
      code: base.value.code,
      status: base.value.status,
      schema: schema.value,
      crossFieldRules: crossFieldRules.value || [],
      canvasGroups: canvasGroups.value || [],
      draftSchema: schema.value
    },
    null,
    2
  )
);

const openSchemaJsonPreview = () => {
  schemaJsonPreviewOpen.value = true;
};

const openCreateGroupDialog = () => {
  createGroupDialogOpen.value = true;
};

const resetCreateGroupDialog = () => {
  createGroupTitle.value = '';
};

const confirmCreateGroup = () => {
  const ok = createGroupByTitle(createGroupTitle.value);
  if (!ok) {
    ElMessage.warning('请输入分组名称');
    return;
  }
  createGroupDialogOpen.value = false;
};

const openRenameGroupDialog = (gid: string, title: string) => {
  renamingGroupId.value = String(gid || '');
  renameGroupTitle.value = String(title || '');
  renameGroupDialogOpen.value = true;
};

const resetRenameGroupDialog = () => {
  renamingGroupId.value = '';
  renameGroupTitle.value = '';
};

const confirmRenameGroup = () => {
  const ok = renameGroupByIdTitle(renamingGroupId.value, renameGroupTitle.value);
  if (!ok) {
    ElMessage.warning('请输入新的分组名称');
    return;
  }
  renameGroupDialogOpen.value = false;
};
</script>

<style scoped lang="scss" src="./index.scss"></style>
