export default function Navbar(){
    return (
        <div className="navbar shadow-sm bg-base-100">
			<div className="navbar-start">
                <div className="flex-none">
                    <a className="btn btn-ghost text-lg">
                        <img 
                            src="/img/logo.png"
                            width={40}
                        />
                        Yorusaki
                    </a>
                </div>
            </div>
            <div className="navbar-end">
                <div className="flex-none">
                    <a className="btn btn-ghost text-xl" href="https://github.com/BoboiAzumi/Yorusaki.git">
                        <img 
                            src="/img/github.svg"
                            width={20}
                        />
                    </a>
                </div>
            </div>
		</div>
    )
}