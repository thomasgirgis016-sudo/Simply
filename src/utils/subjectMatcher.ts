import { Subject } from '../types';

export function isSubjectMatch(
  itemSubjectId: string | undefined,
  currentSubject: Subject
): boolean {
  if (!itemSubjectId) return true;
  if (itemSubjectId === currentSubject.id || itemSubjectId === currentSubject.name) return true;

  const itemId = itemSubjectId.toLowerCase();
  const currId = currentSubject.id.toLowerCase();
  const currName = currentSubject.name.toLowerCase();

  // Chemistry
  if (
    (itemId.includes('chem') || itemId.includes('0620') || itemId.includes('4ch1')) &&
    (currId.includes('chem') || currName.includes('chem') || currId.includes('0620') || currId.includes('4ch1'))
  ) {
    return true;
  }

  // Physics
  if (
    (itemId.includes('phys') || itemId.includes('0625') || itemId.includes('4ph1')) &&
    (currId.includes('phys') || currName.includes('phys') || currId.includes('0625') || currId.includes('4ph1'))
  ) {
    return true;
  }

  // Biology
  if (
    (itemId.includes('bio') || itemId.includes('0610') || itemId.includes('4bi1')) &&
    (currId.includes('bio') || currName.includes('bio') || currId.includes('0610') || currId.includes('4bi1'))
  ) {
    return true;
  }

  // Mathematics
  if (
    (itemId.includes('math') || itemId.includes('0580') || itemId.includes('4ma1') || itemId.includes('0606')) &&
    (currId.includes('math') || currName.includes('math') || currId.includes('0580') || currId.includes('4ma1') || currId.includes('0606'))
  ) {
    return true;
  }

  // English as a Second Language
  if (
    (itemId.includes('esl') || itemId.includes('0510') || itemId.includes('0511') || itemId.includes('4es1') || itemId.includes('second language')) &&
    (currId.includes('esl') || currName.includes('second language') || currId.includes('0510') || currId.includes('4es1'))
  ) {
    return true;
  }

  // Computer Science
  if (
    (itemId.includes('cs') || itemId.includes('0478') || itemId.includes('computer')) &&
    (currId.includes('cs') || currName.includes('computer') || currId.includes('0478'))
  ) {
    return true;
  }

  // Economics
  if (
    (itemId.includes('econ') || itemId.includes('0455') || itemId.includes('4ec1')) &&
    (currId.includes('econ') || currName.includes('economic') || currId.includes('0455'))
  ) {
    return true;
  }

  // Accounting
  if (
    (itemId.includes('acc') || itemId.includes('0452') || itemId.includes('4ac1')) &&
    (currId.includes('acc') || currName.includes('accounting') || currId.includes('0452'))
  ) {
    return true;
  }

  // History
  if (
    (itemId.includes('hist') || itemId.includes('0470') || itemId.includes('4hi1')) &&
    (currId.includes('hist') || currName.includes('history') || currId.includes('0470'))
  ) {
    return true;
  }

  // Geography
  if (
    (itemId.includes('geo') || itemId.includes('0460') || itemId.includes('4ge1')) &&
    (currId.includes('geo') || currName.includes('geography') || currId.includes('0460'))
  ) {
    return true;
  }

  // Combined Science includes Bio, Chem, Phys
  if (currId.includes('0653') || currId.includes('0654') || currName.includes('combined science')) {
    if (itemId.includes('chem') || itemId.includes('phys') || itemId.includes('bio')) return true;
  }

  return false;
}
