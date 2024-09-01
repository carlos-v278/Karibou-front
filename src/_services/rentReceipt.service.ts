import Axios from './caller.service';

const setTenantPayedRent = async (body: {
  rentReceiptId?: number;
  lang: string;
}): Promise<any> => {
  if (body.rentReceiptId != undefined) {
    return await Axios.post('/api/rent_receipts/payed', body);
  }
  return null;
};

export const rentReceiptService: {
  setTenantPayedRent: (body: {
    rentReceiptId?: number;
    lang: string;
  }) => Promise<any>;
} = {
  setTenantPayedRent,
};
