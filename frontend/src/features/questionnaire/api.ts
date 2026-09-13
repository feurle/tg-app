import apiClient from '../../lib/apiClient';
import type { Questionnaire, QuestionnaireFormData } from './types';

const BASE = '/api/questionnaire';

export const questionnaireApi = {
  submit: (data: QuestionnaireFormData) => apiClient.post<Questionnaire>(BASE, data),
  getAll: () => apiClient.get<Questionnaire[]>(BASE),
  getById: (id: number) => apiClient.get<Questionnaire>(`${BASE}/${id}`),
  delete: (id: number) => apiClient.delete<void>(`${BASE}/${id}`),
};
