/**
 * Translations registry for multi-language / i18n support.
 *
 * Each top-level key under `TRANSLATIONS` is a domain (e.g. `labels`,
 * `messages`, `errors`). Each domain holds language buckets (e.g. `en`, `vi`)
 * mapping a logical key to the localized text.
 *
 * Access pattern:
 *   TRANSLATIONS.labels[Constants.LANGUAGE].lblLogin
 *
 * Add new keys here so that locators and pages can reference UI text without
 * hard-coding language-specific strings.
 */

export type Language = 'en' | 'vi';

export interface LabelDictionary {
    lblLogin: string;
    lblLogout: string;
    lblSignIn: string;
    lblRegister: string;
    lblSubmit: string;
    lblSave: string;
    lblCancel: string;
    lblEdit: string;
    lblDelete: string;
    lblSearch: string;
    lblAddNew: string;
    lblConfirmDelete: string;
    lblCancelDelete: string;
}

export interface MessageDictionary {
    msgLoginSuccess: string;
    msgLogoutSuccess: string;
    msgRegisterSuccess: string;
    msgDeleteSuccess: string;
}

export interface TranslationsShape {
    labels: Record<Language, LabelDictionary>;
    messages: Record<Language, MessageDictionary>;
}

export const TRANSLATIONS: TranslationsShape = {
    labels: {
        en: {
            lblLogin: 'Login',
            lblLogout: 'Logout',
            lblSignIn: 'Sign In',
            lblRegister: 'Register',
            lblSubmit: 'Submit',
            lblSave: 'Save',
            lblCancel: 'Cancel',
            lblEdit: 'Edit',
            lblDelete: 'Delete',
            lblSearch: 'Search',
            lblAddNew: 'Add New',
            lblConfirmDelete: 'Confirm Delete',
            lblCancelDelete: 'Cancel Delete',
        },
        vi: {
            lblLogin: 'Đăng nhập',
            lblLogout: 'Đăng xuất',
            lblSignIn: 'Đăng nhập',
            lblRegister: 'Đăng ký',
            lblSubmit: 'Gửi',
            lblSave: 'Lưu',
            lblCancel: 'Huỷ',
            lblEdit: 'Sửa',
            lblDelete: 'Xoá',
            lblSearch: 'Tìm kiếm',
            lblAddNew: 'Thêm mới',
            lblConfirmDelete: 'Xác nhận xoá',
            lblCancelDelete: 'Huỷ xoá',
        },
    },
    messages: {
        en: {
            msgLoginSuccess: 'You logged into a secure area!',
            msgLogoutSuccess: 'You logged out of the secure area!',
            msgRegisterSuccess: 'Your account has been successfully created.',
            msgDeleteSuccess: 'Delete successfully!',
        },
        vi: {
            msgLoginSuccess: 'Bạn đã đăng nhập thành công!',
            msgLogoutSuccess: 'Bạn đã đăng xuất thành công!',
            msgRegisterSuccess: 'Tài khoản đã được tạo thành công.',
            msgDeleteSuccess: 'Xoá thành công!',
        },
    },
};
