import { OrderStatusEnum } from '../orders/order-status.enum';

type LocaleMessages = Record<string, { title: string; body: string }>;

/**
 * Customer-facing status notifications, localized FR / AR / EN (MA-first).
 */
const MESSAGES: Record<OrderStatusEnum, LocaleMessages> = {
  [OrderStatusEnum.scheduled]: {
    fr: { title: 'Commande reçue', body: 'Votre commande a été planifiée.' },
    ar: { title: 'تم استلام الطلب', body: 'تمت جدولة طلبك.' },
    en: { title: 'Order received', body: 'Your order has been scheduled.' },
  },
  [OrderStatusEnum.driverAssigned]: {
    fr: { title: 'Chauffeur assigné', body: 'Un chauffeur a été assigné.' },
    ar: { title: 'تم تعيين سائق', body: 'تم تعيين سائق لطلبك.' },
    en: { title: 'Driver assigned', body: 'A driver has been assigned.' },
  },
  [OrderStatusEnum.pickedUp]: {
    fr: { title: 'Linge récupéré', body: 'Votre linge a été récupéré.' },
    ar: { title: 'تم الاستلام', body: 'تم استلام غسيلك.' },
    en: { title: 'Picked up', body: 'Your laundry has been picked up.' },
  },
  [OrderStatusEnum.atFacility]: {
    fr: { title: 'À la blanchisserie', body: 'Votre linge est arrivé.' },
    ar: { title: 'في المغسلة', body: 'وصل غسيلك إلى المغسلة.' },
    en: { title: 'At facility', body: 'Your laundry arrived at the facility.' },
  },
  [OrderStatusEnum.inCleaning]: {
    fr: { title: 'En cours de nettoyage', body: 'Votre linge est en traitement.' },
    ar: { title: 'قيد التنظيف', body: 'جاري تنظيف غسيلك.' },
    en: { title: 'In cleaning', body: 'Your laundry is being cleaned.' },
  },
  [OrderStatusEnum.ready]: {
    fr: { title: 'Prêt', body: 'Votre linge est prêt.' },
    ar: { title: 'جاهز', body: 'غسيلك جاهز.' },
    en: { title: 'Ready', body: 'Your laundry is ready.' },
  },
  [OrderStatusEnum.outForDelivery]: {
    fr: { title: 'En livraison', body: 'Votre linge est en route.' },
    ar: { title: 'قيد التوصيل', body: 'غسيلك في الطريق إليك.' },
    en: { title: 'Out for delivery', body: 'Your laundry is on its way.' },
  },
  [OrderStatusEnum.delivered]: {
    fr: { title: 'Livré', body: 'Votre commande a été livrée. Merci !' },
    ar: { title: 'تم التوصيل', body: 'تم توصيل طلبك. شكرًا!' },
    en: { title: 'Delivered', body: 'Your order was delivered. Thank you!' },
  },
  [OrderStatusEnum.cancelled]: {
    fr: { title: 'Annulé', body: 'Votre commande a été annulée.' },
    ar: { title: 'ملغى', body: 'تم إلغاء طلبك.' },
    en: { title: 'Cancelled', body: 'Your order has been cancelled.' },
  },
};

export function getStatusMessage(
  status: OrderStatusEnum,
  locale?: string | null,
): { title: string; body: string } {
  const byLocale = MESSAGES[status];
  const lang = locale && byLocale[locale] ? locale : 'fr';
  return byLocale[lang] ?? byLocale.fr;
}
