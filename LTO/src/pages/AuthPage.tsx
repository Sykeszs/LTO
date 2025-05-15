import SignIn from './SignIn';
import SignUp from './SignUp';
import Logo from './Logo';
import YouTubeEmbed from './YouTubeEmbed';

const AuthPage = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="flex h-[13vh] bg-gray-200 shadow-md px-6 py-2">
        <div className="w-1/2 flex items-start">
          <Logo />
        </div>
        <div className="w-1/2 flex items-start justify-end">
          <div className="w-full hidden md:block">
            <SignIn onLogin={onLogin} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden px-6 pb-6">
        <div className="w-1/2 pr-3 flex items-center justify-center">
          <YouTubeEmbed />
        </div>

        <div className="w-1/2 pl-3 h-full flex items-center justify-center">
          <SignUp />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
