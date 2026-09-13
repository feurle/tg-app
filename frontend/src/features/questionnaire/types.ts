export interface OwnerDetails {
  name: string;
  email: string;
  firstPet: boolean | null;
  reasonForChoosing: string;
}

export interface PetDetails {
  name: string;
  origin: string;
  breederRearing: string;
  historyBeforeOwner: string;
  ageWhenAcquired: string;
  ownedSince: string;
  neutered: boolean | null;
  neuteredAge: string;
  neuteringReason: string;
  behaviorChangesAfterNeutering: string;
  school: string;
  knownCommands: string;
  feeding: string;
  supplements: string;
  digestion: string;
  lastDeworming: string;
  bloodTest: string;
}

export interface QuestionnaireFormData {
  owner: OwnerDetails;
  pet: PetDetails;
}

export interface Questionnaire extends QuestionnaireFormData {
  id: number;
  submittedAt: string;
}

export const EMPTY_QUESTIONNAIRE: QuestionnaireFormData = {
  owner: {
    name: '',
    email: '',
    firstPet: null,
    reasonForChoosing: '',
  },
  pet: {
    name: '',
    origin: '',
    breederRearing: '',
    historyBeforeOwner: '',
    ageWhenAcquired: '',
    ownedSince: '',
    neutered: null,
    neuteredAge: '',
    neuteringReason: '',
    behaviorChangesAfterNeutering: '',
    school: '',
    knownCommands: '',
    feeding: '',
    supplements: '',
    digestion: '',
    lastDeworming: '',
    bloodTest: '',
  },
};
