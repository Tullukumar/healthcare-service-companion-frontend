function DoctorPending() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl">

        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-50 text-4xl">
            ⏳
          </div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Verification Pending
          </h1>

          <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">
            Your doctor profile has been submitted successfully.
            The hospital administrator is reviewing your application.
          </p>

          <div className="mt-8 rounded-xl bg-yellow-50 px-5 py-4 text-left">
            <p className="font-semibold text-yellow-800">
              Application Status
            </p>

            <p className="mt-1 text-sm text-yellow-700">
              Pending hospital administrator approval
            </p>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            You will be able to access your doctor dashboard
            after your profile is approved.
          </p>

        </div>

      </div>
    </main>
  );
}

export default DoctorPending;