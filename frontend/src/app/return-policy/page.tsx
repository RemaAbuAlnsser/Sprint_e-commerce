export default function ReturnPolicyPage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Title */}
        <h1
          className="text-3xl lg:text-4xl font-black text-center mb-10"
          style={{ fontFamily: 'var(--font-logo), system-ui' }}
        >
          سياسة <span className="text-primary">التبديل والاسترجاع</span>
        </h1>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8 leading-relaxed text-gray-700">
          
          {/* Warranty */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              1. الكفالة
            </h2>
            <p>
              جميع المنتجات المباعة تشمل كفالة لمدة <strong>سنة كاملة</strong> ضد عيوب التصنيع.
            </p>
          </div>

          {/* Return */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              2. الترجيع بسبب عيب أو مشكلة
            </h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                في حال وجود مشكلة أو عيب مصنعي في المنتج، يحق للزبون إرجاع المنتج.
              </li>
              <li>
                تكلفة التوصيل (الشحن) في هذه الحالة تكون على <strong>الشركة</strong>.
              </li>
            </ul>
          </div>

          {/* Exchange */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              3. سياسة التبديل
            </h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                خدمة التبديل متاحة خلال <strong>7 أيام فقط</strong> من تاريخ شراء المنتج.
              </li>
              <li>
                يشترط أن يكون المنتج بحالته الأصلية وغير متضرر، مع كامل الإكسسوارات والتغليف.
              </li>
            </ul>
          </div>

          {/* Shipping */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              4. تكلفة الشحن في التبديل
            </h2>
            <p>
              في حالات التبديل (بدون وجود عيب مصنعي)، تكون تكلفة الشحن على <strong>الزبون</strong>.
            </p>
          </div>

          {/* Notes */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              5. ملاحظات عامة
            </h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                لا يتم قبول أي طلب تبديل أو ترجيع بعد انتهاء المدة المحددة.
              </li>
              <li>
                تحتفظ الشركة بحق فحص المنتج قبل الموافقة النهائية على التبديل أو الترجيع.
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  )
}
