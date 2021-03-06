
import Model from '../models/Model';
import { InternalServerError } from '../utils/errorHandlers';
import { dev_logger } from '../utils/loggers';

import
{ 
    add_loan_to_db,
    get_loan_by_id,
    repay_history,
    check_loan_existence,
    add_repayment_to_db,
    return_repay_or_error,
    update_loan_status,
    update_loan_balance,
    sendFollowUpMessage,
    sendNewApplicationMessage
} from './helpers/LoansController';

export const loans_model = new Model('loans');
export const repayments_model = new Model('repayments');
const rows = `id, userid, createdon, status, repaid, useremail,
amount, tenor, interest, balance, paymentinstallment`;

const LoansController = {

    get_user_loans: async (req, res) => {
        const { id } = req.params;
        const clause = `WHERE userid=${id}`;
        try {
            const data = await loans_model.select(rows, clause);
            return res.status(200).json({ data: data.rows });
        }
        catch (e) { return InternalServerError(res, e); }
    },
    get_all_loans: async (req, res) => {
        const { status, repaid } = req.query;
        // const rows = ;
        const clause = `WHERE status='${status}' AND repaid='${repaid}'`;
        dev_logger(`rep ${repaid}, ${typeof repaid}`);
        try {
            let data;
            if (status && repaid) {
                data = await loans_model.select(rows, clause);
            }
            else {
                data = await loans_model.select(rows);
            }
            return res.status(200).json({ data: data.rows });
        }
        catch (e) { return InternalServerError(res, e); }
    },

    get_loan: async (req, res) => {
        const { id } = req.params;
        try {
            const loan = await get_loan_by_id(loans_model, id, res);
            if (loan) {
                return res.status(200).json({ data: loan });
            }
            return res.status(404)
                .json({ error: `Loan with id ${id} not found` });
        }
        catch (e) { return; }
    },

    create_loan: async (req, res) => {
        try {
            const { rows } = await add_loan_to_db(loans_model, req, res);
            const [ { id }, ] = rows;
            const loan = await get_loan_by_id(loans_model, id, res, 201);
            sendNewApplicationMessage(loan);
            return res.status(201).json({ data: loan });
        }
        catch (e) { return; }
    },

    approve_or_reject_loan: async (req, res) => {
        const { id } = req.params;
        let status;
        if (req.url.includes('approve')) { status = 'approved';}
        if (req.url.includes('reject')) { status = 'rejected';}

        req.status = status;
        try {
            const loan = await check_loan_existence(loans_model, id, res);
            if (loan) {
                await update_loan_status(loans_model, req, res);
                const loan = await get_loan_by_id(loans_model, id, res);
                sendFollowUpMessage(status, loan);
                return res.status(200).json({ data: loan });
            }
            return res.status(404)
                .json({ error: `Loan with id ${id} not found` });
        }
        catch (e) { return InternalServerError(res, e); }
    },

    loan_repayment_history: async (req, res) => {
        const { id } = req.params;
        try {
            const loan = await check_loan_existence(loans_model, id, res);
            if (loan) {
                const repays = await repay_history(repayments_model, id, res);
                return res.status(200).json({ data: repays });
            }
            return res.status(404)
                .json({ error: `Loan with ${id} not found` });
        }
        catch (e) { return InternalServerError(res, e); }
    },

    post_repayment: async (req, res) => {
        try {
            const { rows } = await add_repayment_to_db(
                repayments_model, req, res
            );
            const [ { id }, ] = rows;
            await update_loan_balance(loans_model, req, res);
            return return_repay_or_error(repayments_model, id, res, 201);
        }
        catch (e) { return; }
    },

    get_repayment: async (req, res) => {
        const { id } = req.params;
        try {
            return return_repay_or_error(repayments_model, id, res, 200);
        }
        catch (e) { return; }
    },

    get_all_repayments: async (req, res) => {
        try {
            const data = await repayments_model.select(
                'id, loanid, adminid, createdon, amount',
            );
            return res.status(200).json({ data: data.rows });
        }
        catch (e) { return InternalServerError(res, e); }
    },
};


export default LoansController;
