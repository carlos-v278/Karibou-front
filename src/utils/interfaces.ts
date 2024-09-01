export interface UserAuth {
  email?: string;
  password?: string;
}

export interface NavLinks {
  to?: string;
  name?: string;
  size?: string;
  icon?: string;
  noShow?:boolean,
}

export interface Apartment {
  id?: number;
  floor?: number;
  number?: number;
  rent?: number;
  owner?: UserProfile;
  tenants?: tenant[] | null;
  streetName?: string;
  streetNumber?: number;
  zipCode?: number;
  city?: string;
  extraCharge?: number;
  country?: string;
  building?: string;
  rentReceipts?: RentReceipt[];
}

export interface Building {
  id: number;
  city: string;
  country: string;
  number: number;
  street: string;
  zipcode: number;
}

export interface Person {
  id?: number;
  email?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  picture?: string;
  postalAdressName?: string;
  postalAdressNumber?: number;
  postalAdressZipCode?: number;
  postalAdressCity?: string;
  country?: string;
}
export interface UserProfile extends Person {
  roles: string[];
}

export interface UserProfileEdit {
  firstname?: string;
  lastname?: string;
  username?: string;
  password?: string;
}
export interface UserSyndicateProfileSignIn {
  firstname?: string;
  lastname?: string;
  email?: string;
  username?: string;
  password?: string;
  syndicates: SyndicateInformations[];
}

export interface UserOwnerProfileSignIn extends Person {
  password?: string;
  properties: Apartment[];
}
export interface SyndicateInformations {
  street?: string;
  streetNumber?: number;
  siret?: string;
  siren?: string;
  type?: string;
  name?: string;
  buildings?: SyndicateBuilding[];
}

export interface SyndicateInformations {
  street?: string;
  streetNumber?: number;
  siret?: string;
  siren?: string;
  type?: string;
  name?: string;
  buildings?: SyndicateBuilding[];
}

export interface SyndicateBuilding {
  city?: string;
  country?: string;
  number?: number;
  street?: string;
  zipcode?: number;
}

export interface TenantInfosInvit {
  firstname?: string;
  email?: string;
  lastname?: string;
  username?: string;
  password?: string;
  location?: string;
  postalAdressName?: undefined,
  postalAdressNumber?: undefined,
  postalAdressZipCode?: undefined,
  postalAdressCity?: undefined,
  country?: undefined,
}
export interface OwnerInfosInvit {
  firstname?: string;
  email?: string;
  lastname?: string;
  username?: string;
  password?: string;
  postalAdressName?: string;
  postalAdressNumber?: number;
  postalAdressZipCode?: number;
  postalAdressCity?: string;
  country?: string;
  properties: Apartment[];
}
export interface OwnerInfosProperty {
  number: number;
  floor: number;
  rent: number;
  building?: string;
}

export interface BuildingsOptions {
  uriId?: string;
  label?: string;
}

// building details data

export interface BuildingDetails {
  id?: number;
  city?: string;
  country?: string;
  number?: number;
  street?: string;
  zipcode?: number;
  advertisements?: Advertisement[];
  apartments?: BuildingDetailsApartment[];
  syndicate?: BuildingDetailsSyndicate;
  allMembers?: Person[];
}

export interface Advertisement {
  id?: number;
  title?: string;
  publishedAt?: string;
  description?: string;
  price?: number;
  type?: string;
  pictures?: AdvertisementPicture[];
  owner?: UserProfile;
}
export interface AdvertisementPicture {
  id?: number;
  file?: string;
}
export interface BuildingDetailsApartment {
  id?: number;
  floor?: number;
  number?: number;
  rent?: number;
  tenants?: string[] | Person[];
  owner?: string | Person;
}

export interface BuildingDetailsSyndicate {
  id?: number;
  name?: string;
  siren?: string;
  siret?: string;
  street?: string;
  street_number?: number;
  type?: string;
  users?: string[] | UserProfile;
}

export interface CurBuildingDetails {
  id?: number;
  label?: string;
}

export interface PostAdvertisement {
  title?: string;
  description?: string;
  price?: number;
  type?: string;
  building?: string;
  owner?: string;
}
export interface Conversation {
  id?: number;
  participants?: UserProfile[];
  messages?: MessageApi[];
  receiver?: UserProfile;
  lastMessage:  MessageApi;
}

export interface MessageApi {
  id?: number;
  conversation?: string;
  createdAt?:string;
  content:string;
  owner?: Person
}

export interface Message {
  id?: number;
  from?:string;
  text?: string;
  picture?: string;
  createdAt?:string;
}
export interface UserMessage {
  id?: number;
  user: UserProfile | null;
  message?: string;
  picture?: string;
  createdAt: number;
}

export interface RentReceipt {
  id?: number;
  receiptDate: string;
  apartment?: string;
  file?: string;
  tenant?: tenant;
  payed: boolean;
}

//languages
export interface LangOption {
  value: string;
  label: string;
  icon: string;
}

export interface localDateLang {
  days: string[];
  daysShort: string[];
  months: string[];
  monthsShort: string[];
}

export interface tenant {
  email?: string;
  firstname?: string;
  id?: number;
  lastname?: string;
  username?: string;
}

export interface ApartmentOption {
  uriId?: string;
  label?: string;
}

export interface NewRentReceipt {
  apartment: ApartmentOption | null;
  apartmentId?: number;
  selectedDate?: number;
  rent?: number;
  tenantId?: number;
  lang: string;
}

export interface tenantOption {
  id?: number;
  label?: string;
}
