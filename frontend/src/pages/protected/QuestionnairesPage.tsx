import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { questionnaireApi } from '../../features/questionnaire/api';
import type { Questionnaire } from '../../features/questionnaire/types';
import QuestionnaireDetailModal from '../../features/questionnaire/components/QuestionnaireDetailModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { ApiError } from '../../lib/apiClient';

type Modal =
  | { kind: 'detail'; questionnaire: Questionnaire }
  | { kind: 'delete'; questionnaire: Questionnaire }
  | null;

export default function QuestionnairesPage() {
  const [items, setItems] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        setItems(await questionnaireApi.getAll());
      } catch {
        setError(t('questionnaire.loadError'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [t]);

  async function handleDelete() {
    if (modal?.kind !== 'delete') return;
    const id = modal.questionnaire.id;
    try {
      await questionnaireApi.delete(id);
      setItems((prev) => prev.filter((q) => q.id !== id));
      setModal(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.deleteError'));
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">{t('questionnaire.management')}</div>
        <div className="page-subtitle">{t('questionnaire.subtitle')}</div>
      </div>

      {error && (
        <p style={{ color: 'var(--danger)', margin: '0 32px 1rem' }}>{error}</p>
      )}

      {loading ? (
        <p style={{ marginLeft: '32px' }}>{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <p style={{ margin: '0 32px', color: 'var(--text-muted)' }}>{t('questionnaire.empty')}</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('questionnaire.col.owner')}</th>
                <th>{t('questionnaire.col.pet')}</th>
                <th>{t('questionnaire.col.submittedAt')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((q) => (
                <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => setModal({ kind: 'detail', questionnaire: q })}>
                  <td style={{ fontWeight: 500 }}>{q.owner.name || t('common.empty')}</td>
                  <td className="td-secondary">{q.pet.name || t('common.empty')}</td>
                  <td className="td-secondary">{new Date(q.submittedAt).toLocaleString()}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button onClick={() => setModal({ kind: 'detail', questionnaire: q })} className="icon-btn" title={t('common.view')}>
                        👁
                      </button>
                      <button onClick={() => setModal({ kind: 'delete', questionnaire: q })} className="icon-btn danger" title={t('common.delete')}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal?.kind === 'detail' && (
        <QuestionnaireDetailModal questionnaire={modal.questionnaire} onClose={() => setModal(null)} />
      )}

      {modal?.kind === 'delete' && (
        <ConfirmDialog
          message={t('questionnaire.deleteConfirm', {
            owner: modal.questionnaire.owner.name,
            pet: modal.questionnaire.pet.name,
          })}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
