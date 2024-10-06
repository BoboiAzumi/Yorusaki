export default function Navbar(){
    return (
        <div className="navbar shadow-sm bg-base-100">
			<div className="navbar-start">
                <div className="flex-none">
                    <a className="btn btn-ghost text-xl">
                        <img 
                            src="/img/logo.png"
                            width={45}
                        />
                        Yorusaki
                    </a>
                </div>
            </div>
            <div className="navbar-end">
                <div className="flex-none">
                    <a className="btn btn-ghost text-xl">
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