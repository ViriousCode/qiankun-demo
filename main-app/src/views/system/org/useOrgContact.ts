import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { updateOrgContact } from '@/api/systemOrg';
import type { OrgNode } from '@/api/systemOrg';

export function useOrgContact(fetchData: () => Promise<void>) {
  const contactDialogVisible = ref(false);
  const contactSubmitLoading = ref(false);
  const contactForm = reactive({ orgId: 0, orgName: '', leader: '', phone: '' });

  const handleContact = (row: OrgNode) => {
    contactForm.orgId = row.id;
    contactForm.orgName = row.name || '';
    contactForm.leader = row.leader || '';
    contactForm.phone = row.phone || '';
    contactDialogVisible.value = true;
  };

  const submitContactForm = async () => {
    contactSubmitLoading.value = true;
    try {
      await updateOrgContact(contactForm.orgId, {
        leader: contactForm.leader,
        phone: contactForm.phone
      });
      ElMessage.success('保存成功');
      contactDialogVisible.value = false;
      await fetchData();
    } finally {
      contactSubmitLoading.value = false;
    }
  };

  return {
    contactDialogVisible,
    contactForm,
    contactSubmitLoading,
    handleContact,
    submitContactForm
  };
}
